/*!
 * VisualEditor ContentEditable LanguageAnnotation class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable language annotation.
 *
 * @class
 * @extends ve.ce.Annotation
 * @constructor
 * @param {ve.dm.LanguageAnnotation} model Model to observe
 * @param {Object} [config] Config options
 */
ve.ce.LanguageAnnotation = function VeCeLanguageAnnotation( model, config ) {
	var msgDir = '';
	// Parent constructor
	ve.ce.Annotation.call( this, model, config );

	// DOM changes
	this.$.addClass( 've-ce-LanguageAnnotation' );

	this.$.attr( 'lang', model.getAttribute( 'lang' ) );
	this.$.attr( 'dir', model.getAttribute( 'dir' ) );

	// If the language is "RTL", make a mention in the tooltip
	if ( model.getAttribute( 'dir' ) !== 'ltr' ) {
		msgDir = ve.msg( 'visualeditor-languageinspector-block-tooltip-rtldirection' );
	}

	// TODO:
	// When ULS is active, use $.uls.getAutonym(lang) to get the full
	// language name in the tooltip
	// (eg 'he' will be 'Hebrew' and 'en' will be 'English')
	this.$.attr( 'title' , ve.msg( 'visualeditor-languageinspector-block-tooltip', model.getAttribute( 'lang' ), msgDir ) );
};

/* Inheritance */

ve.inheritClass( ve.ce.LanguageAnnotation, ve.ce.Annotation );

/* Static Properties */

ve.ce.LanguageAnnotation.static.name = 'language';

ve.ce.LanguageAnnotation.static.tagName = 'span';

/* Registration */

ve.ce.annotationFactory.register( ve.ce.LanguageAnnotation );
