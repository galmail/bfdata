// readFromSocket.js

Meteor.methods({

	readFromSocket: function (eventId){
		var wsUrl = "";
		this.unblock();
    var _obj = Meteor.http.call("GET", "https://api.mongolab.com/api/1/databases/actions/collections/sockets?q={\"wsUrlPresent\": true, \"eventId\": \"" + eventId + "\" }&apiKey=wGtHOle0k7O745R7Z_7Emzr0bNGcDIb2");
    var wsUrl = _obj.data[0].wsUrl;
    return { result: "success", wsUrl: wsUrl };
		


		var socket = io(wsUrl);
		var args = JSON.stringify([{"Topic": _obj.data[0].matchId.toString(),"LiveUpdates":"true","OddsUpdates":"true","VideoUpdates":"true","ConditionsUpdates":"true"}]);
		socket.emit('subscribe', args);
		socket.on('connect', Meteor.bindEnvironment(function() {
		  console.log('Connected to the websocket!');
		  socket.on('message', Meteor.bindEnvironment(function(data) {
		    console.log(data);
		  }, function(e) {
		    throw e;
		  }));
		  socket.on('disconnect', Meteor.bindEnvironment(function() {
		    console.log('Disconnected from the websocket!');
		  }, function(e) {
		    throw e;
		  }));
		}, function(e) {
		  throw e;
		}));

  }

});
