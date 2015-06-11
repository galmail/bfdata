// readFromSocket.js

Meteor.methods({

	readFromSocket: function (eventId){

		var wsConnectFn = function(){
			Fiber(function(){
				var wsUrl = "";
				var mUrl = "https://api.mongolab.com/api/1/databases/actions/collections/sockets?q={\"wsUrlPresent\": true, \"eventId\": \"" + eventId + "\" }&s={\"wsDate\": -1}&apiKey=wGtHOle0k7O745R7Z_7Emzr0bNGcDIb2";
		    var _obj = Meteor.http.call("GET", mUrl);
		    var wsUrl = _obj.data[0].wsUrl;
		    var matchId = parseInt(_obj.data[0].matchId);
				console.log('opening socket: ' + wsUrl);
				var ws = new WebSocket(wsUrl);
				ws.on('open', function() {
			    console.log('socket connected.');
			    ws.send('5:::{"name":"subscribe","args":[{"Topic":"' + matchId + '","LiveUpdates":"true","OddsUpdates":"true","VideoUpdates":"true","ConditionsUpdates":"true"}]}');
			  });
			  ws.on('close', function close() {
				  console.log('socket disconnected.');
				  wsConnectFn();
				});
			  ws.on('message', function(msg){
			  	if(msg.indexOf('5:::')!=0) return;
			  	console.log('\n\n***************************\n\n');
			  	var regexEID = msg.match(/EID.*\d+/g);
			  	if(!regexEID) return;
			  	var eventId = parseInt(regexEID[0].split(':')[1]);
			  	console.log("eventId: " + eventId);
			  	console.log("eventName: " + BFCodes.getEvent(eventId));
			  });
			}).run();
		};

		wsConnectFn();

		return { matchId: matchId, wsUrl: wsUrl };

  }

});
