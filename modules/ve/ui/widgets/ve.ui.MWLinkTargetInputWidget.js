/*!
 * VisualEditor UserInterface MWLinkTargetInputWidget class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/*global mw*/

/**
 * Creates an ve.ui.MWLinkTargetInputWidget object.
 *
 * @class
 * @extends ve.ui.LinkTargetInputWidget
 *
 * @constructor
 * @param {Object} [config] Config options
 * @cfg {jQuery} [$overlay] Element to append menu to
 */
ve.ui.MWLinkTargetInputWidget = function VeUiMWLinkTargetInputWidget( config ) {
	// Config intialization
	config = config || {};

	// Parent constructor
	ve.ui.LinkTargetInputWidget.call( this, config );

	// Properties
	this.menu = new ve.ui.TextInputMenuWidget(
		this,
		{ '$$': ve.ui.get$$( config.$overlay ), '$overlay': config.$overlay, '$input': this.$input }
	);
	this.annotation = null;
	this.existingPages = {};
	this.matchingPages = {};
	this.existingPagesRequest = null;
	this.matchingPagesRequest = null;
	this.waiting = 0;
	this.previousMatches = null;

	// Events
	this.$input.on( {
		'click': ve.bind( this.onClick, this ),
		'focus': ve.bind( this.onFocus, this ),
		'blur': ve.bind( this.onBlur, this )
	} );
	this.menu.on( 'select', ve.bind( this.onMenuItemSelect, this ) );
	this.on( 'change', ve.bind( this.onChange, this ) );

	// Initialization
	this.$.addClass( 've-ui-mwLinkTargetInputWidget' );
	this.menu.$.addClass( 've-ui-mwLinkTargetInputWidget-menu' );
};

/* Inheritance */

ve.inheritClass( ve.ui.MWLinkTargetInputWidget, ve.ui.LinkTargetInputWidget );

/* Methods */

/**
 * Handles click events.
 *
 * @method
 * @param {jQuery.Event} e Mouse click event
 */
ve.ui.MWLinkTargetInputWidget.prototype.onClick = function () {
	if ( !this.disabled ) {
		this.openMenu();
	}
};

/**
 * Handles focus events.
 *
 * @method
 * @param {jQuery.Event} e Input focus event
 */
ve.ui.MWLinkTargetInputWidget.prototype.onFocus = function () {
	if ( !this.disabled ) {
		this.openMenu();
	}
};

/**
 * Handles blur events.
 *
 * @method
 * @param {jQuery.Event} e Input blur
 */
ve.ui.MWLinkTargetInputWidget.prototype.onBlur = function () {
	this.menu.hide();
};

/**
 * Handles change events.
 *
 * @method
 * @param {ve.ui.MenuItemWidget} item Menu item
 */
ve.ui.MWLinkTargetInputWidget.prototype.onMenuItemSelect = function ( item ) {
	if ( item ) {
		this.setAnnotation( item.getData() );
	}
};

/**
 * Set the value of the input.
 *
 * Overrides setValue to keep annotations in sync.
 *
 * @method
 * @param {string} value New value
 */
ve.ui.MWLinkTargetInputWidget.prototype.onChange = function () {
	this.openMenu();
};

/**
 * Set the value of the input.
 *
 * Overrides setValue to keep annotations in sync.
 *
 * @method
 * @param {string} value New value
 */
ve.ui.MWLinkTargetInputWidget.prototype.setValue = function ( value ) {
	// Keep annotation in sync with value
	value = this.sanitizeValue( value );

	// Call parent method
	ve.ui.TextInputWidget.prototype.setValue.call( this, value );
};

/**
 * Opens the menu.
 *
 * @method
 * @chainable
 */
ve.ui.MWLinkTargetInputWidget.prototype.openMenu = function () {
	this.populateMenu();
	this.queryPageExistence();
	this.queryMatchingPages();
	if ( this.value.length && !this.menu.isVisible() ) {
		this.menu.show();
	}
	return this;
};

/**
 * Populates the menu.
 *
 * @method
 * @chainable
 */
ve.ui.MWLinkTargetInputWidget.prototype.populateMenu = function () {
	var i, len,
		items = [],
		externalLink = this.getExternalLinkAnnotationFromUrl( this.value ),
		internalLink = this.getInternalLinkAnnotationFromTitle( this.value ),
		pageExists = this.existingPages[this.value],
		matchingPages = this.matchingPages[this.value];

	// Reset items and groups
	this.menu.clearGroups();
	this.menu.addGroups( {
		'externalLink': 'External link',
		'newPage': 'New page',
		'existingPage': 'Existing page',
		'matchingPage': 'Matching page'
	} );

	// Hide on empty target
	if ( !this.value.length ) {
		this.menu.hide();
		return this;
	}

	// External links
	if ( ve.init.platform.getExternalLinkUrlProtocolsRegExp().test( this.value ) ) {
		items.push(
			new ve.ui.MenuItemWidget( this.value, externalLink, { 'group': 'externalLink' } )
		);
	}

	// Internal links
	if ( !pageExists && ( !matchingPages || matchingPages.indexOf( this.value ) === -1 ) ) {
		items.push( new ve.ui.MenuItemWidget( this.value, internalLink, { 'group': 'newPage' } ) );
	}
	if ( matchingPages ) {
		for ( i = 0, len = matchingPages.length; i < len; i++ ) {
			internalLink = new ve.dm.MWInternalLinkAnnotation( { 'title': matchingPages[i] } );
			items.push(
				new ve.ui.MenuItemWidget(
					matchingPages[i],
					internalLink,
					{ 'group': this.value === matchingPages[i] ? 'existingPage' : 'matchingPage' }
				)
			);
		}
		this.previousMatches = matchingPages;
	}

	// Add items
	this.menu.addItems( items );

	// Auto-select
	this.menu.selectItem( this.menu.getItemFromData( this.annotation ), true );
	if ( !this.menu.getSelectedItem() ) {
		this.menu.selectItem( this.menu.getItemFromIndex( 0 ), true );
		this.annotation = null;
	}

	return this;
};

/**
 * Signals that an response is pending.
 *
 * @method
 * @chainable
 */
ve.ui.MWLinkTargetInputWidget.prototype.pushPending = function () {
	this.pending++;
	this.$.addClass( 've-ui-mwLinkTargetInputWidget-pending' );
	return this;
};

/**
 * Signals that an response is complete.
 *
 * @method
 * @chainable
 */
ve.ui.MWLinkTargetInputWidget.prototype.popPending = function () {
	this.pending--;
	this.$.removeClass( 've-ui-mwLinkTargetInputWidget-pending' );
	return this;
};

/**
 * Gets an internal link annotation.
 *
 * File: or Category: links will be prepended with a colon so they are interpreted as a links rather
 * than image inclusions or categorizations.
 *
 * @method
 * @param {string} target Page title
 * @returns {ve.dm.MWInternalLinkAnnotation}
 */
ve.ui.MWLinkTargetInputWidget.prototype.getInternalLinkAnnotationFromTitle = function ( target ) {
	var title;
	try {
		title = new mw.Title( target );
		if ( title.getNamespaceId() === 6 || title.getNamespaceId() === 14 ) {
			target = ':' + target;
		}
	} catch ( e ) { }
	return new ve.dm.MWInternalLinkAnnotation( { 'title': target } );
};

/**
 * Gets an external link annotation.
 *
 * @method
 * @param {string} target Web address
 * @returns {ve.dm.MWExternalLinkAnnotation}
 */
ve.ui.MWLinkTargetInputWidget.prototype.getExternalLinkAnnotationFromUrl = function ( target ) {
	return new ve.dm.MWExternalLinkAnnotation( { 'href': target } );
};

/**
 * Gets a target from an annotation.
 *
 * @method
 * @param {ve.dm.MWExternalLinkAnnotation|ve.dm.MWInternalLinkAnnotation} annotation Annotation
 * @returns {string} Target
 */
ve.ui.MWLinkTargetInputWidget.prototype.getTargetFromAnnotation = function ( annotation ) {
	if ( annotation instanceof ve.dm.MWExternalLinkAnnotation ) {
		return annotation.data.href;
	} else if ( annotation instanceof ve.dm.MWInternalLinkAnnotation ) {
		return annotation.data.title;
	}
	return '';
};

/**
 * Checks page existence for the current value.
 *
 * {ve.ui.MWLinkTargetInputWidget.populateMenu} will be called immediately if the page existence has
 * been cached, or as soon as the API returns a result.
 *
 * @method
 * @chainable
 */
ve.ui.MWLinkTargetInputWidget.prototype.queryPageExistence = function () {
	if ( this.existingPagesRequest ) {
		this.existingPagesRequest.abort();
		this.existingPagesRequest = null;
	}
	if ( this.value in this.existingPages ) {
		this.populateMenu();
	} else {
		this.pushPending();
		this.existingPagesRequest = $.ajax( {
			'url': mw.util.wikiScript( 'api' ),
			'data': {
				'format': 'json',
				'action': 'query',
				'indexpageids': '',
				'titles': this.value,
				'converttitles': ''
			},
			'dataType': 'json',
			'success': ve.bind( function ( data ) {
				this.existingPagesRequest = null;
				var page,
					exists = false;
				if ( data.query ) {
					page = data.query.pages[data.query.pageids[0]];
					exists = ( page.missing === undefined && page.invalid === undefined );
					// Cache result for normalized title
					this.existingPages[page.title] = exists;
				}
				// Cache result for original input
				this.existingPages[this.value] = exists;
				this.populateMenu();
			}, this ),
			'complete': ve.bind( function () {
				this.popPending();
			}, this )
		} );
	}
	return this;
};

/**
 * Checks matching pages for the current value.
 *
 * {ve.ui.MWLinkTargetInputWidget.populateMenu} will be called immediately if matching pages have
 * been cached, or as soon as the API returns a result.
 *
 * @method
 * @chainable
 */
ve.ui.MWLinkTargetInputWidget.prototype.queryMatchingPages = function () {
	if ( this.matchingPagesRequest ) {
		this.matchingPagesRequest.abort();
		this.matchingPagesRequest = null;
	}
	if ( this.value in this.matchingPages ) {
		this.populateMenu();
	} else {
		this.pushPending();
		this.matchingPagesRequest = $.ajax( {
			'url': mw.util.wikiScript( 'api' ),
			'data': {
				'format': 'json',
				'action': 'opensearch',
				'search': this.value,
				'namespace': 0,
				'suggest': ''
			},
			'dataType': 'json',
			'success': ve.bind( function ( data ) {
				this.matchingPagesRequest = null;
				if ( ve.isArray( data ) && data.length ) {
					// Cache the matches to the query
					this.matchingPages[this.value] = data[1];
					this.populateMenu();
				}
			}, this ),
			'complete': ve.bind( function () {
				this.popPending();
			}, this )
		} );
	}
	return this;
};