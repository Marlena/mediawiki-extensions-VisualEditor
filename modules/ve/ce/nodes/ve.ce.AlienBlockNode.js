/**
 * VisualEditor content editable AlienBlockNode class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable node for an alien block node.
 *
 * @class
 * @constructor
 * @extends {ve.ce.LeafNode}
 * @param {ve.dm.AlienBlockNode} model Model to observe.
 */
ve.ce.AlienBlockNode = function VeCeAlienBlockNode( model ) {
	// Parent constructor
	ve.ce.LeafNode.call( this, 'alienBlock', model );

	// Events
	this.model.addListenerMethod( this, 'update', 'onUpdate' );

	// Initialization
	this.onUpdate();
};

/* Inheritance */

ve.inheritClass( ve.ce.AlienBlockNode, ve.ce.LeafNode );

/* Static Members */

/**
 * Node rules.
 *
 * @see ve.ce.NodeFactory
 * @static
 * @member
 */
ve.ce.AlienBlockNode.rules = {
	'canBeSplit': false
};

/* Methods */

ve.ce.AlienBlockNode.prototype.onUpdate = function () {
	var $new = $( this.model.getAttribute( 'html' ) );
	this.$.replaceWith( $new );
	this.$ = $new;
	this.$.addClass( 've-ce-alienBlockNode' );
	this.$.attr( 'contenteditable', false );
	return;
	this.$.add(this.$.contents()).each(function() {
		if ( this.nodeType == Node.ELEMENT_NODE ) {
			if ( $(this).css('float') == 'none' && !$(this).hasClass('ve-ce-alienBlockNode') ) {
				return;
			}
			$(this).append('<img src="http://upload.wikimedia.org/wikipedia/commons/c/ce/Transparent.gif" class="shield">');
		}
	});
};

/* Registration */

ve.ce.nodeFactory.register( 'alienBlock', ve.ce.AlienBlockNode );