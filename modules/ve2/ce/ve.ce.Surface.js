/**
 * ContentEditable surface.
 *
 * @class
 * @constructor
 * @param model {ve.dm.Surface} Model to observe
 */
ve.ce.Surface = function( $container, model ) {
	// Inheritance
	ve.EventEmitter.call( this );

	// Properties
	this.model = model;
	this.documentView = new ve.ce.Document( model.getDocument() );
	this.contextView = new ve.ui.Context( this );
	this.$ = $container;
	this.clipboard = {};

	// Driven by mousedown and mouseup events
	this.isMouseDown = false;
	this.range = {
		anchorNode: null,
		anchorOffset: null,
		focusNode: null,
		focusOffset: null
	};

	// init rangy in case of Toshiba...
	rangy.init();
	
	// Events
	this.$.on( {
		'keypress': ve.proxy( this.onKeyPress, this ),
		'keydown': ve.proxy( this.onKeyDown, this ),
		'mousedown': ve.proxy( this.onMouseDown, this ),
		'mouseup': ve.proxy( this.onMouseUp, this ),
		'mousemove': ve.proxy( this.onMouseMove, this ),
		'cut copy': ve.proxy( this.onCutCopy, this ),
		'beforepaste paste': ve.proxy( this.onPaste, this ),
		'dragover drop': function( e ) {
			// Prevent content drag & drop
			e.preventDefault();
			return false;
		}
	} );
	this.model.on( 'select', ve.proxy( this.onSelect, this ) );

	// Initialization
	this.$.append( this.documentView.documentNode.$ );

	try {
		document.execCommand( "enableObjectResizing", false, false );
		document.execCommand( "enableInlineTableEditing", false, false );
	} catch (e) { }
};


/* Methods */

ve.ce.Surface.prototype.onSelect = function( e ) {
	console.log("onSelect", e);
};

ve.ce.Surface.prototype.onKeyPress = function( e ) {
	console.log('onKeyPress');
	switch ( e.which ) {
		// Enter
		case 13:
			e.preventDefault();
			this.handleEnter();
			break;
	}
};

ve.ce.Surface.prototype.onKeyDown = function( e ) {
	console.log('onKeyDown');
	// Prevent all interactions coming from keyboard when mouse is down (possibly selecting)
	if ( this.isMouseDown === true ) {
		e.preventDefault();
		return false;
	}

	switch ( e.keyCode ) {
		// Left arrow
		case 37:
			break;
		// Right arrow
		case 39:
			break;
		// Backspace
		case 8:

			tx = ve.dm.Transaction.newFromRemoval( this.documentView.model, this.model.getSelection() );
			ve.dm.TransactionProcessor.commit( this.documentView.model, tx );
			this.showCursor(this.model.getSelection().start);


			e.preventDefault();
			break;
		// Delete
		case 46:
			e.preventDefault();
			break;
	}
};

ve.ce.Surface.prototype.onMouseDown = function( e ) {
	this.isMouseDown = true;

	// TODO: Add special handling for clicking on images and alien nodes
	var $leaf = $( e.target ).closest( '.ve-ce-leafNode' );
};

ve.ce.Surface.prototype.onMouseUp = function( e ) {
	var handler = function() {
		var rangySel = rangy.getSelection(),
			offset1,
			offset2;

		if ( rangySel.anchorNode === null && rangySel.focusNode === null ) {
			setTimeout( ve.proxy( handler, this ), 100 );
			return;
		}

		if (
			rangySel.anchorNode !== this.range.anchorNode ||
			rangySel.anchorOffset !== this.range.anchorOffset ||
			rangySel.focusNode !== this.range.focusNode ||
			rangySel.focusOffset !== this.range.focusOffset
		) {
			if ( rangySel.isCollapsed ) {
				var offset = this.getOffset( rangySel.anchorNode, rangySel.anchorOffset );
				this.model.setSelection( new ve.Range( offset ) );
			} else {
				if ( !rangySel.isBackwards() ) {
					offset1 = this.getOffset( rangySel.anchorNode, rangySel.anchorOffset );
					offset2 = this.getOffset( rangySel.focusNode, rangySel.focusOffset );
				} else {
					offset1 = this.getOffset( rangySel.focusNode, rangySel.focusOffset );
					offset2 = this.getOffset( rangySel.anchorNode, rangySel.anchorOffset );
				}

				var offset1Fixed = this.getNearestCorrectOffset( offset1, 1 ),
					offset2Fixed = this.getNearestCorrectOffset( offset2, -1 );

				var range;
				if ( !rangySel.isBackwards() ) {
					range = new ve.Range( offset1Fixed, offset2Fixed );
				} else {
					range = new ve.Range( offset2Fixed, offset1Fixed );
				}

				this.model.setSelection( range );

				if ( offset1 !== offset1Fixed || offset2 !== offset2Fixed ) {
					this.showSelection( range );
				}
			}
			this.range.anchorNode = rangySel.anchorNode;
			this.range.anchorOffset = rangySel.anchorOffset;
			this.range.focusNode = rangySel.focusNode;
			this.range.focusOffset = rangySel.focusOffset;
		}

		this.isMouseDown = false;
	};
	setTimeout( ve.proxy( handler, this ), 0 );
};

ve.ce.Surface.prototype.onMouseMove = function( e ) {
	if ( this.isMouseDown === true ) {
	}
};

/**
 * @method
 */
ve.ce.Surface.prototype.onCutCopy = function( e ) {
	var _this = this,
		sel = rangy.getSelection(),
		$frag = null,
		key = '';

	// Create key from text and element names
	$frag = $(sel.getRangeAt(0).cloneContents());
	$frag.contents().each(function() {
		key += this.textContent || this.nodeName;
	});
	key = key.replace( /\s/gm, '' );

	// Set surface clipboard
	this.clipboard[key] = ve.copyArray(
		this.documentView.model.getData( this.model.getSelection() )
	);

	if ( e.type == 'cut' ) {
		setTimeout( function() {
			var	selection = null,
				tx = null;
		
			// We don't like how browsers cut, so let's undo it and do it ourselves.
			document.execCommand('undo', false, false);
			
			selection = _this.model.getSelection();
			
			// Transact
			tx = ve.dm.Transaction.newFromRemoval( _this.documentView.model, selection );
			_this.model.transact( tx );

			// Place cursor
			_this.showCursor( selection.start );
			_this.model.setSelection( new ve.Range( selection.start ) );
		}, 1 );
	}
};

/**
 * @method
 */
ve.ce.Surface.prototype.onPaste = function( e ) {
	var	_this = this,
		selection = this.model.getSelection(),
		tx = null;
	
	// Pasting into a range? Remove first.
	if (!rangy.getSelection().isCollapsed) {
		tx = ve.dm.Transaction.newFromRemoval( _this.documentView.model, selection );
		_this.model.transact( tx );
	}
	
	$('#paste').html('').show().focus();

	setTimeout( function() {
		var	key = '',
			pasteData = null,
			tx = null;
		
		// Create key from text and element names
		$('#paste').hide().contents().each(function() {
			key += this.textContent || this.nodeName;
		});
		key = key.replace( /\s/gm, '' );

		// Get linear model from surface clipboard or create array from unknown pasted content
		pasteData = ( _this.clipboard[key] ) ? _this.clipboard[key] : $('#paste').text().split('');

		// Transact
		tx = ve.dm.Transaction.newFromInsertion(
			_this.documentView.model, selection.start, pasteData
		);
		_this.model.transact( tx );

		// Place cursor
		_this.showCursor( selection.start + pasteData.length );
		_this.model.setSelection( new ve.Range( selection.start + pasteData.length ) );
		_this.documentView.documentNode.$.focus();
	}, 1 );
};

ve.ce.Surface.prototype.handleEnter = function() {
	/* TODO: Determine if we still need this
	this.stopPolling();
	*/
	var selection = this.model.getSelection(),
		tx;
		
	if ( selection.from !== selection.to ) {
		tx = ve.dm.Transaction.newFromRemoval( this.documentView.model, selection );
		this.model.transact( tx );
	}
	
	var	node = this.documentView.getNodeFromOffset( selection.to ),
		nodeOffset = this.documentView.getDocumentNode().getOffsetFromNode( node ),
		stack = [];
	
	// Build stack
	ve.Node.traverseUpstream( node, function( node ) {
		var elementType = node.type;
		if ( !node.canBeSplit() ) {
			return false;
		}
		stack.splice(
			stack.length / 2,
			0,
			{ 'type': '/' + elementType },
			{
				'type': elementType,
				'attributes': ve.copyObject( node.model.attributes )
			}
		);
		return true;
	} );

	// Transact
	tx = ve.dm.Transaction.newFromInsertion( this.documentView.model, selection.from, stack );
	this.model.transact( tx );

	// Place cursor
	selection.from = selection.to = this.model.getDocument().getRelativeContentOffset( selection.from, 1 );

	this.showCursor(selection.from);
	this.model.setSelection( new ve.Range( selection.from ) );
	
	/* TODO: Determine if we still need this
	var _this = this;
	setTimeout( function() {
		_this.poll.prevText = _this.poll.prevHash = _this.poll.prevOffset = _this.poll.node = null;
		_this.startPolling();
	}, 0 );
	*/
};

ve.ce.Surface.prototype.showCursor = function( offset ) {
	this.showSelection( new ve.Range( offset ) );
};

ve.ce.Surface.prototype.showSelection = function( range ) {
	var rangySel = rangy.getSelection(),
		rangyRange = rangy.createRange(),
		start,
		end;

	if ( range.start !== range.end ) {
		start = this.getNodeAndOffset( range.start );
		end = this.getNodeAndOffset( range.end ),
		rangyRange.setStart( start.node, start.offset );
		rangyRange.setEnd( end.node, end.offset );
		rangySel.setSingleRange( rangyRange, range.start !== range.from );
	} else {
		start = end = this.getNodeAndOffset( range.start );
		rangyRange.setStart( start.node, start.offset );
		rangySel.setSingleRange( rangyRange );
	}
};

// TODO: Find a better name and a better place for this method
ve.ce.Surface.prototype.getNearestCorrectOffset = function( offset, direction ) {
	direction = direction > 0 ? 1 : -1;

	if (
		ve.dm.Document.isContentOffset( this.documentView.model.data, offset ) ||
		this.hasSlugAtOffset( offset )
	) {
		return offset;
	}

	var	contentOffset = this.documentView.model.getNearestContentOffset( offset, direction ),
		structuralOffset =
			this.documentView.model.getNearestStructuralOffset( offset, direction, true );

	if ( !this.hasSlugAtOffset( structuralOffset ) ) {
		return contentOffset;
	}

	if ( direction === 1 ) {
		if ( contentOffset < offset ) {
			return structuralOffset;
		} else {
			return Math.min( contentOffset, structuralOffset );
		}
	} else {
		if ( contentOffset > offset ) {
			return structuralOffset;
		} else {
			return Math.max( contentOffset, structuralOffset );
		}
	}
};

// TODO: Find a better name and a better place for this method - probably in a document view?
ve.ce.Surface.prototype.hasSlugAtOffset = function( offset ) {
	var node = this.documentView.documentNode.getNodeFromOffset( offset );
	if ( node.canHaveChildren() ) {
		return node.hasSlugAtOffset( offset );
	} else {
		return false;
	}
};

/**
 * Based on a given offset returns DOM node and offset that can be used to place a cursor.
 *
 * The results of this function are meant to be used with rangy.
 *
 * @method
 * @param offset {Integer} Linear model offset
 * @returns {Object} Object containing a node and offset property where node is an HTML element and
 * offset is the position within the element
 */
ve.ce.Surface.prototype.getNodeAndOffset = function( offset ) {
	var	node = this.documentView.getNodeFromOffset( offset ),
		startOffset = this.documentView.getDocumentNode().getOffsetFromNode( node ) +
			( ( node.isWrapped() ) ? 1 : 0 ),
		current = [node.$.contents(), 0],
		stack = [current],
		item,
		$item,
		length;

	while ( stack.length > 0 ) {
		if ( current[1] >= current[0].length ) {
			stack.pop();
			current = stack[ stack.length - 1 ];
			continue;
		}
		item = current[0][current[1]];
		if ( item.nodeType === Node.TEXT_NODE ) {
			length = item.textContent.length;
			if ( offset >= startOffset && offset <= startOffset + length ) {
				return {
					node: item,
					offset: offset - startOffset
				};
			} else {
				startOffset += length;
			}
		} else if ( item.nodeType === Node.ELEMENT_NODE ) {
			$item = current[0].eq( current[1] );
			if ( $item.hasClass('ve-ce-slug') ) {
				if ( offset === startOffset ) {
					return {
						node: $item[0],
						offset: 1
					};
				}
			} else if ( $item.is( '.ve-ce-branchNode, .ve-ce-leafNode' ) ) {
				length = $item.data( 'node' ).model.getOuterLength();
				if ( offset >= startOffset && offset < startOffset + length ) {
					stack.push( [$item.contents(), 0] );
					current[1]++;
					current = stack[stack.length-1];
					continue;
				} else {
					startOffset += length;
				}
			} else {
				stack.push( [$item.contents(), 0] );
				current[1]++;
				current = stack[stack.length-1];
				continue;
			}

		}
		current[1]++;
	}
};

/**
 * Gets the linear offset based on a given DOM node and DOM offset
 *
 * @method
 * @param domNode {DOM Node} DOM node
 * @param domOffset {Integer} DOM offset within the DOM Element
 * @returns {Integer} Linear model offset
 */
ve.ce.Surface.prototype.getOffset = function( domNode, domOffset ) {
	if ( domNode.nodeType === Node.TEXT_NODE ) {
		return this.getOffsetFromTextNode( domNode, domOffset );
	} else {
		return this.getOffsetFromElementNode( domNode, domOffset );
	}
};

ve.ce.Surface.prototype.getOffsetFromTextNode = function( domNode, domOffset ) {
	var	$node = $( domNode ).closest(
			'.ve-ce-branchNode, .ve-ce-alienBlockNode, .ve-ce-alienInlineNode'
		),
		nodeModel = $node.data( 'node' ).getModel();
	if ( ! $node.hasClass( 've-ce-branchNode' ) ) {
		return nodeModel.getOffset();
	}
	var	current = [$node.contents(), 0],
		stack = [current],
		offset = 0,
		item,
		$item;
	while ( stack.length > 0 ) {
		if ( current[1] >= current[0].length ) {
			stack.pop();
			current = stack[ stack.length - 1 ];
			continue;
		}
		item = current[0][current[1]];
		if ( item.nodeType === Node.TEXT_NODE ) {
			if ( item === domNode ) {
				offset += domOffset;
				break;
			} else {
				offset += item.textContent.length;
			}
		} else if ( item.nodeType === Node.ELEMENT_NODE ) {
			$item = current[0].eq( current[1] );
			if ( $item.hasClass( 've-ce-slug' ) ) {
				if ( $item.contents()[0] === domNode ) {
					break;
				}
			} else if ( $item.hasClass( 've-ce-leafNode' ) ) {
				offset += 2;
			} else if ( $item.hasClass( 've-ce-branchNode' ) ) {
				offset += $item.data( 'node' ).getOuterLength();
			} else {
				stack.push( [$item.contents(), 0 ] );
				current[1]++;
				current = stack[stack.length-1];
				continue;
			}
		}
		current[1]++;
	}
	return offset + nodeModel.getOffset() + ( nodeModel.isWrapped() ? 1 : 0 );
};

ve.ce.Surface.prototype.getOffsetFromElementNode = function( domNode, domOffset, addOuterLength ) {
	var	$domNode = $( domNode ),
		nodeModel,
		node;

	if ( $domNode.hasClass( 've-ce-slug' ) ) {
		if ( $domNode.prev().length > 0 ) {
			nodeModel = $domNode.prev().data( 'node' ).getModel();
			return nodeModel.getOffset() + nodeModel.getOuterLength();
		}
		if ( $domNode.next().length > 0 ) {
			nodeModel = $domNode.next().data( 'node' ).getModel();
			return nodeModel.getOffset();
		}
	}

	if ( domOffset === 0 ) {
		node = $domNode.data( 'node' );
		if ( node ) {
			nodeModel = $domNode.data( 'node' ).getModel();
			if ( addOuterLength === true ) {
				return nodeModel.getOffset() + nodeModel.getOuterLength();
			} else {
				return nodeModel.getOffset();
			}
		} else {
			node = $domNode.contents().last()[0];
		}
	} else {
		node = $domNode.contents()[ domOffset - 1 ];
	}

	if ( node.nodeType === Node.TEXT_NODE ) {
		return this.getOffsetFromTextNode( node, node.length );
	} else {
		return this.getOffsetFromElementNode( node, 0, true );
	}
};

ve.ce.Surface.prototype.getModel = function() {
	return this.model;
};
/* Supplies the selection anchor coordinates to contextView */
ve.ce.Surface.prototype.getSelectionRect = function() {
	var rangySel = rangy.getSelection();
	return {
		start: rangySel.getStartDocumentPos(),
		end: rangySel.getEndDocumentPos()
	};
};

/* Inheritance */

ve.extendClass( ve.ce.Surface, ve.EventEmitter );