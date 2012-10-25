/**
 * VisualEditor data model Converter tests.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

QUnit.module( 've.dm.Converter' );

/* Tests */

QUnit.test( 'getDataElementFromDomElement', function ( assert ) {
	var msg, conversion;
	for ( msg in ve.dm.example.conversions ) {
		conversion = ve.dm.example.conversions[msg];
		assert.deepEqual(
			ve.dm.converter.getDataElementFromDomElement( conversion.domElement ),
			conversion.dataElement,
			msg
		);
	}
} );

QUnit.test( 'getDomElementFromDataElement', function ( assert ) {
	var msg, conversion;
	for ( msg in ve.dm.example.conversions ) {
		conversion = ve.dm.example.conversions[msg];
		assert.equalDomElement(
			ve.dm.converter.getDomElementFromDataElement( conversion.dataElement ),
			conversion.domElement,
			msg
		);
	}
} );

QUnit.test( 'getDataFromDom', function ( assert ) {
	var msg,
		cases = ve.dm.example.domToDataCases;
	for ( msg in cases ) {
		if ( cases[msg].html !== null ) {
			ve.dm.example.preprocessAnnotations( cases[msg].data );
			assert.deepEqual(
				ve.dm.converter.getDataFromDom( $( '<div>' ).html( cases[msg].html )[0] ),
				cases[msg].data,
				msg
			);
		}
	}
} );

QUnit.test( 'getDomFromData', function ( assert ) {
	var msg,
		cases = ve.dm.example.domToDataCases;
	for ( msg in cases ) {
		ve.dm.example.preprocessAnnotations( cases[msg].data );
		assert.equalDomElement(
			ve.dm.converter.getDomFromData( cases[msg].data ),
			$( '<div>' ).html( cases[msg].normalizedHtml || cases[msg].html )[0],
			msg
		);
	}
} );

QUnit.test( 'change markers on document', function ( assert ) {
	var data = [
			{ 'type': 'paragraph', 'internal': { 'changed': { 'new': 1 } } },
			'a',
			{ 'type': '/paragraph' }
		],
		expectedHtml = '<div data-ve-changed="{&quot;childrenRemoved&quot;:1}">' +
			'<p data-ve-changed="{&quot;new&quot;:1}">a</p></div>';
	data.internal = { 'changed': { 'childrenRemoved': 1 } };
	assert.equalDomElement(
		ve.dm.converter.getDomFromData( data ),
		$( expectedHtml )[0],
		'change markers on document node are propagated to wrapping <div>'
	);
} );
