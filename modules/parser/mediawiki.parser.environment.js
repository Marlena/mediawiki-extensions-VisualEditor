var title = require('./mediawiki.Title.js'),
	Title = title.Title,
	Namespace = title.Namespace;

var wikipedias = "en|de|fr|nl|it|pl|es|ru|ja|pt|zh|sv|vi|uk|ca|no|fi|cs|hu|ko|fa|id|tr|ro|ar|sk|eo|da|sr|lt|ms|eu|he|sl|bg|kk|vo|war|hr|hi|et|az|gl|simple|nn|la|th|el|new|roa-rup|oc|sh|ka|mk|tl|ht|pms|te|ta|be-x-old|ceb|br|be|lv|sq|jv|mg|cy|lb|mr|is|bs|yo|an|hy|fy|bpy|lmo|pnb|ml|sw|bn|io|af|gu|zh-yue|ne|nds|ku|ast|ur|scn|su|qu|diq|ba|tt|my|ga|cv|ia|nap|bat-smg|map-bms|wa|kn|als|am|bug|tg|gd|zh-min-nan|yi|vec|hif|sco|roa-tara|os|arz|nah|uz|sah|mn|sa|mzn|pam|hsb|mi|li|ky|si|co|gan|glk|ckb|bo|fo|bar|bcl|ilo|mrj|fiu-vro|nds-nl|tk|vls|se|gv|ps|rue|dv|nrm|pag|koi|pa|rm|km|kv|udm|csb|mhr|fur|mt|wuu|lij|ug|lad|pi|zea|sc|bh|zh-classical|nov|ksh|or|ang|kw|so|nv|xmf|stq|hak|ay|frp|frr|ext|szl|pcd|ie|gag|haw|xal|ln|rw|pdc|pfl|krc|crh|eml|ace|gn|to|ce|kl|arc|myv|dsb|vep|pap|bjn|as|tpi|lbe|wo|mdf|jbo|kab|av|sn|cbk-zam|ty|srn|kbd|lo|ab|lez|mwl|ltg|ig|na|kg|tet|za|kaa|nso|zu|rmy|cu|tn|chr|got|sm|bi|mo|bm|iu|chy|ik|pih|ss|sd|pnt|cdo|ee|ha|ti|bxr|om|ks|ts|ki|ve|sg|rn|dz|cr|lg|ak|tum|fj|st|tw|ch|ny|ff|xh|ng|ii|cho|mh|aa|kj|ho|mus|kr|hz";

var interwikiMap = {};
wikipedias.split('|').forEach( function (prefix) {
	interwikiMap[prefix] = 'http://' + prefix + '.wikipedia.org/w';
});

function Tracer(env) {
	this.env = env;
}
Tracer.prototype = {
	startPass: function(string) {
		if (this.env.trace) {
			console.warn("-- start: " + string);
		}
	},

	endPass: function(string) {
		if (this.env.trace) {
			console.warn("-- end:   " + string);
		}
	},

	processToken: function(token) {
		if (this.env.trace) {
			console.warn("T: " + token.toString(true));
		}
	},

	output: function(string) {
		if (this.env.trace) {
			console.warn(string);
		}
	}
}

var MWParserEnvironment = function(opts) {
	var options = {
		tagHooks: {},
		parserFunctions: {},
		pageCache: {}, // @fixme use something with managed space
		debug: false,
		trace: false,
		wgScriptPath: "/wiki/",
		wgScript: "/wiki/index.php",
		wgUploadPath: "/wiki/images",
		wgScriptExtension: ".php",
		fetchTemplates: false,
		maxDepth: 40,
		pageName: 'Main page',
		interwikiMap: interwikiMap,
		interwikiRegexp: Object.keys(interwikiMap).join('|')
	};
	// XXX: this should be namespaced
	$.extend(options, opts);
	$.extend(this, options);

	// Tracing object
	this.tracer = new Tracer(this);
};

MWParserEnvironment.prototype.addInterwiki = function (prefix, wgScript) {
	this.interwikiMap[prefix] = wgScript;
	this.interwikiRegexp = Object.keys(this.interwikiMap).join('|');
};

// Outstanding page requests (for templates etc)
// Class-static
MWParserEnvironment.prototype.requestQueue = {};

MWParserEnvironment.prototype.lookupKV = function ( kvs, key ) {
	if ( ! kvs ) {
		return null;
	}
	var kv;
	for ( var i = 0, l = kvs.length; i < l; i++ ) {
		kv = kvs[i];
		if ( kv.k.trim() === key ) {
			// found, return it.
			return kv;
		}
	}
	// nothing found!
	return null;
};

MWParserEnvironment.prototype.lookup = function ( kvs, key ) {
	if ( ! kvs ) {
		return null;
	}
	var kv;
	for ( var i = 0, l = kvs.length; i < l; i++ ) {
		kv = kvs[i];
		if ( kv.k.trim() === key ) {
			// found, return it.
			return kv.v;
		}
	}
	// nothing found!
	return null;
};

MWParserEnvironment.prototype.lookupValue = function ( kvs, key ) {
	if ( ! kvs ) {
		return null;
	}
	var kv;
	for ( var i = 0, l = kvs.length; i < l; i++ ) {
		kv = kvs[i];
		if ( kv.v === key ) {
			// found, return it.
			return kv;
		}
	}
	// nothing found!
	return null;
};

/**
 * Trim space and newlines from leading and trailing text tokens.
 */
MWParserEnvironment.prototype.tokenTrim = function ( tokens ) {
	var l = tokens.length,
		i, token;
	// strip leading space
	for ( i = 0; i < l; i++ ) {
		token = tokens[i];
		if ( token.constructor === String ) {
			token = token.replace( /^\s+/, '' );
			tokens[i] = token;
			if ( token !== '' ) {
				break;
			}
		} else {
			break;
		}
	}
	// strip trailing space
	for ( i = l - 1; i >= 0; i-- ) {
		token = tokens[i];
		if ( token.constructor === String ) {
			token = token.replace( /\s+$/, '' );
			tokens[i] = token;
			if ( token !== '' ) {
				break;
			}
		} else {
			break;
		}
	}
	return tokens;
};


/**
 * Convert an array of key-value pairs into a hash of keys to values. For
 * duplicate keys, the last entry wins.
 */
MWParserEnvironment.prototype.KVtoHash = function ( kvs ) {
	if ( ! kvs ) {
		console.warn( "Invalid kvs!: " + JSON.stringify( kvs, null, 2 ) );
		return {};
	}
	var res = {};
	for ( var i = 0, l = kvs.length; i < l; i++ ) {
		var kv = kvs[i],
			key = this.tokensToString( kv.k ).trim();
		//if( res[key] === undefined ) {
		res[key.toLowerCase()] = this.tokenTrim( kv.v );
		//}
	}
	//console.warn( 'KVtoHash: ' + JSON.stringify( res ));
	return res;
};


// Strip 'end' tokens and trailing newlines
MWParserEnvironment.prototype.stripEOFTkfromTokens = function ( tokens ) {
	this.dp( 'stripping end or whitespace tokens' );
	if ( tokens.constructor !== Array ) {
		tokens = [ tokens ];
	}
	if ( ! tokens.length ) {
		return tokens;
	}
	// Strip 'end' tokens and trailing newlines
	var l = tokens[tokens.length - 1];
	if ( l.constructor === EOFTk || l.constructor === NlTk ||
			( l.constructor === String && l.match( /^\s+$/ ) ) ) {
		var origTokens = tokens;
		tokens = origTokens.slice();
		tokens.rank = origTokens.rank;
		while ( tokens.length &&
				((	l.constructor === EOFTk  || l.constructor === NlTk )  ||
			( l.constructor === String && l.match( /^\s+$/ ) ) ) )
		{
			this.dp( 'stripping end or whitespace tokens' );
			tokens.pop();
			l = tokens[tokens.length - 1];
		}
	}
	return tokens;
};

// Does this need separate UI/content inputs?
MWParserEnvironment.prototype.formatNum = function( num ) {
	return num + '';
};

MWParserEnvironment.prototype.getVariable = function( varname, options ) {
	//XXX what was the original author's intention?
	//something like this?:
	//  return this.options[varname];
	return this[varname];
};

MWParserEnvironment.prototype.setVariable = function( varname, value, options ) {
	this[varname] = value;
};

/**
 * @return MWParserFunction
 */
MWParserEnvironment.prototype.getParserFunction = function( name ) {
	if (name in this.parserFunctions) {
		return new this.parserFunctions[name]( this );
	} else {
		return null;
	}
};

/**
 * @return MWParserTagHook
 */
MWParserEnvironment.prototype.getTagHook = function( name ) {
	if (name in this.tagHooks) {
		return new this.tagHooks[name](this);
	} else {
		return null;
	}
};


MWParserEnvironment.prototype.makeTitleFromPrefixedText = function ( text ) {
	text = this.normalizeTitle( text );
	var nsText = text.split( ':', 1 )[0];
	if ( nsText && nsText !== text ) {
		var _ns = new Namespace(0);
		var ns = _ns._defaultNamespaceIDs[ nsText.toLowerCase() ];
		//console.warn( JSON.stringify( [ nsText, ns ] ) );
		if ( ns !== undefined ) {
			return new Title( text.substr( nsText.length + 1 ), ns, nsText, this );
		} else {
			return new Title( text, 0, '', this );
		}
	} else {
		return new Title( text, 0, '', this );
	}
};


// XXX: move to Title!
MWParserEnvironment.prototype.normalizeTitle = function( name ) {
	if (typeof name !== 'string') {
		throw new Error('nooooooooo not a string');
	}
	var forceNS, self = this;
	if ( name.substr( 0, 1 ) === ':' ) {
		forceNS = ':';
		name = name.substr(1);
	} else {
		forceNS = '';
	}


	name = name.trim().replace(/[\s_]+/g, '_');

	// Implement int: as alias for MediaWiki:
	if ( name.substr( 0, 4 ) === 'int:' ) {
		name = 'MediaWiki:' + name.substr( 4 );
	}

	// FIXME: Generalize namespace case normalization
	if ( name.substr( 0, 10 ).toLowerCase() === 'mediawiki:' ) {
		name = 'MediaWiki:' + name.substr( 10 );
	}
	
	function upperFirst( s ) { return s.substr(0, 1).toUpperCase() + s.substr(1); }

	function splitNS ( ) {
		var nsMatch = name.match( /([a-zA-Z-]+):/ ),
			ns = nsMatch && nsMatch[1] || '';
		if( ns !== '' && ns !== name ) {
			if ( self.interwikiMap[ns.toLowerCase()] ) {
				forceNS += ns + ':';
				name = name.substr( nsMatch[0].length );
				splitNS();
			} else {
				name = upperFirst( ns ) + ':' + upperFirst( name.substr( ns.length + 1 ) );
			}
		} else {
			name = upperFirst( name );
		}
	}
	splitNS();
	//name = name.split(':').map( upperFirst ).join(':');
	//if (name === '') {
	//	throw new Error('Invalid/empty title');
	//}
	return forceNS + name;
};

/**
 * @fixme do this for real eh
 */
MWParserEnvironment.prototype.resolveTitle = function( name, namespace ) {
	// Resolve subpages
	if ( name.length && name[0] === '/' ) {
		name = this.normalizeTitle( this.pageName ) + name;
	}
	// FIXME: match against proper list of namespaces
	if ( name.indexOf(':') == -1 && namespace ) {
		// hack hack hack
		name = namespace + ':' + this.normalizeTitle( name );
	}
	// Strip leading ':'
	if (name[0] === ':') {
		name = name.substr( 1 );
	}
	return name;
};

MWParserEnvironment.prototype.tokensToString = function ( tokens, strict ) {
	var out = [];
	//console.warn( 'MWParserEnvironment.tokensToString, tokens: ' + JSON.stringify( tokens ) );
	// XXX: quick hack, track down non-array sources later!
	if ( ! $.isArray( tokens ) ) {
		tokens = [ tokens ];
	}
	for ( var i = 0, l = tokens.length; i < l; i++ ) {
		var token = tokens[i];
		if ( token === undefined ) {
			if ( this.debug ) { console.trace(); }
			this.tp( 'MWParserEnvironment.tokensToString, invalid token: ' + 
							token, ' tokens:', tokens);
			continue;
		}
		if ( token.constructor === String ) {
			out.push( token );
		} else if ( token.constructor === CommentTk || token.constructor === NlTk ) {
			// strip comments and newlines
		} else {
			if ( strict ) {
				return [out.join(''), tokens.slice( i )];
			}
			var tstring = JSON.stringify( token );
			this.dp ( 'MWParserEnvironment.tokensToString, non-text token: ', 
					tstring, tokens);
			if ( this.debug ) { console.trace(); }
			//out.push( tstring );
		}
	}
	this.dp( 'MWParserEnvironment.tokensToString result: ', out );
	return out.join('');
};

/**
 * Perform a shallow clone of a chunk of tokens
 */
MWParserEnvironment.prototype.cloneTokens = function ( chunk ) {
	var out = [],
		token, tmpToken;
	for ( var i = 0, l = chunk.length; i < l; i++ ) {
		token = chunk[i];
		if ( token.constructor === String ) {
			out.push( token );
		} else {
			tmpToken = $.extend( {}, token );
			tmpToken.rank = 0;
			out.push(tmpToken);
		}
	}
	return out;
};

MWParserEnvironment.prototype.decodeURI = function ( s ) {
	return s.replace( /%[0-9a-f][0-9a-f]/g, function( m ) {
		try {
			return decodeURI( m );
		} catch ( e ) {
			return m;
		}
	} );
};

MWParserEnvironment.prototype.sanitizeURI = function ( s ) {
	var host = s.match(/^[a-zA-Z]+:\/\/[^\/]+(?:\/|$)/),
		path = s,
		anchor = null;
	//console.warn( 'host: ' + host );
	if ( host ) {
		path = s.substr( host[0].length );
		host = host[0];
	} else {
		host = '';
	}
	var bits = path.split('#');
	if ( bits.length > 1 ) {
		anchor = bits[bits.length - 1];
		path = path.substr(0, path.length - anchor.length - 1);
	}
	host = host.replace( /%(?![0-9a-fA-F][0-9a-fA-F])|[#|]/g, function ( m ) {
		return encodeURIComponent( m );
	} );
	path = path.replace( /%(?![0-9a-fA-F][0-9a-fA-F])|[ \[\]#|]/g, function ( m ) {
		return encodeURIComponent( m );
	} );
	s = host + path;
	if ( anchor !== null ) {
		s += '#' + anchor;
	}
	return s;
};

/**
 * Simple debug helper
 */
MWParserEnvironment.prototype.dp = function ( ) {
	if ( this.debug ) {
		if ( arguments.length > 1 ) {
			try {
				console.warn( JSON.stringify( arguments, null, 2 ) );
			} catch ( e ) {
				console.trace();
				console.warn( e );
			}
		} else {
			console.warn( arguments[0] );
		}
	}
};

/**
 * Even simpler debug helper that always prints..
 */
MWParserEnvironment.prototype.ap = function ( ) {
	if ( arguments.length > 1 ) {
		try {
			console.warn( JSON.stringify( arguments, null, 2 ) );
		} catch ( e ) {
			console.warn( e );
		}
	} else {
		console.warn( arguments[0] );
	}
};
/**
 * Simple debug helper, trace-only
 */
MWParserEnvironment.prototype.tp = function ( ) {
	if ( this.debug || this.trace ) {
		if ( arguments.length > 1 ) {
			console.warn( JSON.stringify( arguments, null, 2 ) );
		} else {
			console.warn( arguments[0] );
		}
	}
};


if (typeof module == "object") {
	module.exports.MWParserEnvironment = MWParserEnvironment;
}

