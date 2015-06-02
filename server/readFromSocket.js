// readFromSocket.js

Meteor.methods({

	readFromSocket: function (eventId){
		var wsUrl = "";
		this.unblock();

    var _obj = Meteor.http.call("GET", "https://api.mongolab.com/api/1/databases/actions/collections/sockets?q={\"wsUrlPresent\": true, \"eventId\": \"" + eventId + "\" }&apiKey=wGtHOle0k7O745R7Z_7Emzr0bNGcDIb2");
    var wsUrl = _obj.data[0].wsUrl;
    var matchId = _obj.data[0].matchId.toString();

		console.log('opening socket..');
	  var ws = new WebSocket(wsUrl);
	  ws.on('open', function() {
	    console.log('socket connected!!!!!!');
	    //ws.send('hello there!');
	  });
	  ws.on('message', function(message) {
	    console.log('received: %s', message);
	  });







		// socket.on('connect', function(){
		// 	console.log('Connected to Socket!');
		// });
		// socket.on('event', function(data){ console.log('Got Msg',data); });
		// socket.on('disconnect', function(){ console.log('Disconnected from Socket!'); });


		// var socket = io(wsUrl);
		// console.log('connecting to socket: ' + wsUrl);
		
		// socket.emit('subscribe', JSON.stringify({"Topic": matchId,"LiveUpdates":"true","OddsUpdates":"true","VideoUpdates":"true","ConditionsUpdates":"true"}));
		
		// socket.on('connect',function(){
		// 	console.log('Connected to the websocket!');
		// });


		// socket.on('connect', Meteor.bindEnvironment(function() {
		//   console.log('Connected to the websocket!');
		//   socket.on('message', Meteor.bindEnvironment(function(data) {
		//     console.log('received msg',data);
		//   }, function(e) {
		//     throw e;
		//   }));
		//   socket.on('disconnect', Meteor.bindEnvironment(function() {
		//     console.log('Disconnected from the websocket!');
		//   }, function(e) {
		//     throw e;
		//   }));
		// }, function(e) {
		//   throw e;
		// }));

		return { matchId: matchId, wsUrl: wsUrl };

  }

});
