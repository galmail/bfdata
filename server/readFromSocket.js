// readFromSocket.js

global.openedWS = []; // opened websockets saved globally so we can close them later.
global.intervalWS = []; // websockets interval to refresh connections.

monitorLiveEventsBot = function (myevent,stop,callback){

	if(stop){
		if(global.intervalWS[myevent.id]) Meteor.clearInterval(global.intervalWS[myevent.id]);
		if(global.openedWS[myevent.id]) global.openedWS[myevent.id].close();
		return;
	}

	var refreshSocketInterval = 20 * 1000; // every 20sec

	var wsConnectFn = function(){
		Fiber(function(){
			var wsUrl = myevent.wsUrl;
			var matchId = myevent.matchId;
	    if(global.openedWS[myevent.id]){ global.openedWS[myevent.id].close(); }
			console.log('opening socket: ' + wsUrl);
			var ws = new WebSocket(wsUrl);
			ws.on('open', function() {
		    console.log('socket connected.');
		    ws.send('42["subscribe",{"Topic":"'+ matchId +'","LiveUpdates":"true","OddsUpdates":"true","VideoUpdates":"true","ConditionsUpdates":"true"}]');
		    global.openedWS[myevent.id] = ws;
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
		  	var eventName = BFCodes.getEvent(eventId);
		  	console.log("eventName: " + eventName);
		  	if(callback) callback(eventName);
		  });
		}).run();
	};
	
	if(global.intervalWS[myevent.id]) Meteor.clearInterval(global.intervalWS[myevent.id]);
	global.intervalWS[myevent.id] = Meteor.setInterval( function () {
    console.log("refreshing socket...");
		wsConnectFn();
  }, refreshSocketInterval);

  wsConnectFn();

	return { matchId: matchId, wsUrl: wsUrl };

}




Meteor.methods({

	readFromSocket: function(eventId){
		Fiber(function(){
			var myevent = Events.findOne({id: eventId});
			if(myevent.wsUrl==null) return;
			monitorLiveEventsBot(myevent);
		}).run();
		return { res: "success" };
	}

});


