/*!
 * VisualEditor DataModel MWEntityNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel MediaWiki image node.
 *
 * @class
 * @extends ve.dm.ImageNode
 * @constructor
 * @param {number} [length] Length of content data in document
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.MWImageNode = function VeDmMWImageNode( length, element ) {
	ve.dm.ImageNode.call( this, 0, element );
};

/* Inheritance */

ve.inheritClass( ve.dm.MWImageNode, ve.dm.ImageNode );

/* Static Properties */

ve.dm.MWImageNode.static.name = 'MWimage';

ve.dm.MWImageNode.static.matchTagNames = null;

ve.dm.MWImageNode.static.matchRdfaTypes = [ 'mw:Image' ];

ve.dm.MWImageNode.static.toDataElement = function ( domElements ) {
	var i, j, childNode, children = Array.prototype.slice.call( domElements[0].children, 0 ),
		parentResult = ve.dm.ImageNode.static.toDataElement.apply(
			this, [ children ].concat( Array.prototype.slice.call( arguments, 1 ) )
		),
		dataElement = ve.copyObject( parentResult );

	// Preserve the child nodes' attributes in html/0-i/foo
	for ( i = 0; i < domElements[0].childNodes.length; i++ ) {
		childNode = domElements[0].childNodes[i];
		for ( j = 0; j < childNode.attributes.length; j++ ) {
			dataElement.attributes['html/0-' + i + '/' + childNode.attributes[j].name] =
				childNode.attributes[j].value;
		}
	}

	return ve.extendObject( true, dataElement, {
		'type': 'MWimage',
		'attributes': {
			'isLinked': domElements[0].nodeName.toLowerCase() === 'a'
		}
	} );
};

ve.dm.MWImageNode.static.toDomElements = function ( dataElement, doc ) {
	var k, wrapper = doc.createElement( dataElement.attributes.isLinked ? 'a' : 'span' ),
		imageDomElement = ve.dm.ImageNode.static.toDomElements.apply( this, arguments )[0];

	wrapper.appendChild( imageDomElement );
	// Restore attributes from html/0-0/*
	for ( k in dataElement.attributes ) {
		if ( k.indexOf( 'html/0-0/' ) === 0 ) {
			imageDomElement.setAttribute( k.substr( 9 ), dataElement.attributes[k] );
		}
	}

	return [ wrapper ];
};

/* Registration */

ve.dm.modelRegistry.register( ve.dm.MWImageNode );