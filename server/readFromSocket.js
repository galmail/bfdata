// readFromSocket.js

Meteor.methods({

	readFromSocket: function (eventId){

		var wsConnectFn = function(){
			Fiber(function(){
				var wsUrl = global.wsUrl;
				var matchId = global.matchId;
		    if(global.ws){ global.ws.close(); }
				console.log('opening socket: ' + wsUrl);
				var ws = new WebSocket(wsUrl);
				ws.on('open', function() {
			    console.log('socket connected.');
			    ws.send('42["subscribe",{"Topic":"'+ matchId +'","LiveUpdates":"true","OddsUpdates":"true","VideoUpdates":"true","ConditionsUpdates":"true"}]');
			    global.ws = ws;
			  });
			  ws.on('close', function close() {
				  console.log('socket disconnected.');
				});
			  ws.on('message', function(msg){
			  	if(msg.indexOf('42[')!=0) return;
			  	console.log('\n\n***************************\n\n');
			  	var regexEID = msg.match(/EID.*\d+/g);
			  	if(!regexEID) return;
			  	var eventId = parseInt(regexEID[0].split(':')[1]);
			  	console.log("eventId: " + eventId);
			  	console.log("eventName: " + BFCodes.getEvent(eventId));
			  });
			}).run();
		};

		var refreshSocketInterval = 20 * 1000; // 10sec
		
		if(global.wsInterval) Meteor.clearInterval(global.wsInterval);
		global.wsInterval = Meteor.setInterval( function () {
      console.log("refreshing socket...");
			wsConnectFn();
    }, refreshSocketInterval);

    wsConnectFn();

		return { matchId: matchId, wsUrl: wsUrl };

  }

});






