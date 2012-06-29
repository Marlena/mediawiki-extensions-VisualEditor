/**
 * This contains all the callbacks used for handling the client's Socket.IO events
 *
 * @class
 * @constructor
 * @param {collab.Client} client Client adapter that the Callbacks object is to be attached to
 * @param {Socket} socket Socket.IO socket for network I/O
**/
collab.Callbacks = function( client, socket ) {
	this.client = client;
	this.socket = socket;
};

/**
 * Initiate authentication with the server using current logged in user's info
 * The method is called in upstream mode to initiate authentication, and
 * downstream mode when used as a callback for receiving authentication from server.
 *
 * @method
 * @param {String} direction upstream/downstream mode
 * @param {Object} authData Authentication data received from the server
**/
collab.Callbacks.prototype.authenticate = function( direction, authData ) {
	var socket = this.socket;
	if( direction == 'upstream' ) {
		// Upstream mode for sending auth info to the server
		var user = mw.config.get( 'wgUserName' );
		var docTitle = mw.config.get( 'wgPageName' );
		if( user ) {
			this.userName = user;
			// Logged in; Proceed with authentication with server
			socket.emit( 'client_auth', { userName: user, docTitle: docTitle } );
		}
		else {
			// For non-logged in users
		}
	}
	else {
		// Downstream mode for recieving auth info from the server
		var sessionID = authData.sessionID;
		socket.emit( 'client_connect', { userName: user, docTitle: docTitle,
			sessionID: sessionID } );
	}
};

/**
 * Callback method to be invoked when a new client initiates its session
**/
collab.Callbacks.prototype.userConnect = function( userName ) {
	
};

/**
 * Callback method to be invoked when a client disconnects from the editing session
**/
collab.Callbacks.prototype.userDisconnect = function( userName ) {

};

/**
 * Callback method to be invoked when a new transaction arrives at the client
**/
collab.Callbacks.prototype.newTransaction = function( transactionData ) {
	console.log('here');
	var surfaceModel = this.client.editor.getModel();
	var transaction = transactionData.transaction;
	var args = transactionData.args;

	// Create a new transaction model object
	var transactionObj = new ve.dm.Transaction();
	transactionObj.operations = transaction.operations;
	transactionObj.lengthDifference = transaction.lengthDifference;
	transactionObj.isBroadcasted = true;
	if( args.publisherID != this.client.userName ) {
		transactionObj.isBroadcasted = true;

		var selection = surfaceModel.getSelection();
		// Create a default selection if there is no selection
		if( !selection ) {
			selection = new ve.Range( 1, 1 );
		}

		surfaceModel.change( transactionObj, selection );
	}
};

collab.Callbacks.prototype.docTransfer = function( docData ) {
	var html = $('<div>' + docData.html + '</div>' );
	var socket = this.socket,
		client = this.client,
		editor = client.editor,
		surfaceModel = editor.getModel(),
		documentModel = editor.getDocumentModel(),
		documentNode = documentModel.documentNode;
	
	// Load the document data recieved into the editor instance
	var data = ve.dm.converter.getDataFromDom( html[0] );
	var newDocumentModel = new ve.dm.Document( data );
	documentModel.data.splice( 0, documentModel.data.length );
	ve.insertIntoArray( documentModel.data, 0, newDocumentModel.data );
	surfaceModel.selection = new ve.Range( 1, 1 );
	documentNode.splice.apply(
		documentNode,
		[0, documentNode.getChildren().length]
		.concat( newDocumentModel.documentNode.getChildren() )
	);
	surfaceModel.purgeHistory();

	// Bind with surfaceModel's transact event
	if( docData.allowPublish == true ) {
		surfaceModel.on( 'transact', function( transaction ) {
			// Send the transaction if it originates locally; Not received from the server
			if( !transaction.isBroadcasted ) {
				// Inject transaction arguments before sending transaction data
				var transactionData = {
					args: {
						publisherID: client.userName
					},
					transaction: transaction
				};
				console.log(transactionData);
				socket.emit( 'new_transaction', transactionData );
			}
		});
	}

	else {
		// Disable editing entirely
		var view = editor.view;
		var documentNode = view.documentView.documentNode;
		documentNode.$.attr( 'contenteditable', false );
	}
};