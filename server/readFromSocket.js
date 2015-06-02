// readFromSocket.js

Meteor.methods({

	readFromSocket: function (eventId){
		var wsUrl = "";
		this.unblock();

    var _obj = Meteor.http.call("GET", "https://api.mongolab.com/api/1/databases/actions/collections/sockets?q={\"wsUrlPresent\": true, \"eventId\": \"" + eventId + "\" }&apiKey=wGtHOle0k7O745R7Z_7Emzr0bNGcDIb2");
    var wsUrl = _obj.data[0].wsUrl;
    var matchId = parseInt(_obj.data[0].matchId);

		console.log('opening socket..');
	  var ws = new WebSocket(wsUrl);
	 //  var ws = new WebSocket('ws://echo.websocket.org/', {
		//   protocolVersion: 8, 
		//   origin: 'http://websocket.org'
		// });
	  ws.on('open', function() {
	    console.log('socket connected!!!!!!');
	    ws.send('5:::{"name":"subscribe","args":[{"Topic":"' + matchId + '","LiveUpdates":"true","OddsUpdates":"true","VideoUpdates":"true","ConditionsUpdates":"true"}]}');
	  });
	  ws.on('close', function close() {
		  console.log('disconnected');
		});
	  ws.on('message', function(msg){
	  	console.log(msg);
	  	if(msg.indexOf('5:::')!=0) return;
	  	console.log('\n\n***************************\n\n');
	  	var regexEID = msg.match(/EID.*\d+/g);
	  	console.log('c');
	  	if(!regexEID) return;
	  	console.log('d');
	  	var eventId = parseInt(regexEID[0].split(':')[1]);
	  	console.log("eventId: " + eventId);
	  	console.log("eventName: " + BFCodes.getEvent(eventId));
	  });

		return { matchId: matchId, wsUrl: wsUrl };

  }

});
