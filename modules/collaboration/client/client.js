/**
 * Module for establishing/maintaining socket connection with server
**/

collab.client = function( ) {
	var settings = collab.settings;
	var options = {
	};
	_this = this;
	var socket = io.connect( settings.host + ':' + settings.port );
	socket.on( 'connection', function() {
		socket.callbacks = new collab.callbacks( _this );
		_this.bindEvents( socket )
		socket.emit( 'client_connect', { user: 'Dash1291', title: 'Main_Page' } );
	});
};

collab.client.prototype.bindEvents = function( io_socket ) {
	var socket_callbacks = io_socket.callbacks;
	io_socket.on( 'new_transaction', function( data ) {
		socket_callbacks.newTransaction( data );
	});
	
	io_socket.on( 'client_connect', function( data ) {
		socket_callbacks.userConnect( data );
	});

	io_socket.on( 'client_disconnect', function( data ) {
		socket_callbacks.userDisconnect( data );
	});
	io_socket.on( 'document_transfer', function( data ) {
		socket_callbacks.docTransfer( data );
	});
};