// readFromSocket.js

global.openedWS = []; // opened websockets saved globally so we can close them later.
global.intervalWS = []; // websockets interval to refresh connections.

monitorLiveEventsBot = function (myevent,stop){

	if(stop){
		if(global.intervalWS[myevent.id]) Meteor.clearInterval(global.intervalWS[myevent.id]);
		if(global.openedWS[myevent.id]) global.openedWS[myevent.id].close();
		// clear memory
		global.openedWS[myevent.id] = null;
		global.intervalWS[myevent.id] = null;
		return;
	}

	var refreshSocketInterval = 20 * 1000; // every 20sec

	var wsConnectFn = function(){
		Fiber(function(){
			var wsUrl = myevent.wsUrl;
			var matchId = myevent.matchId;
	    if(global.openedWS[myevent.id]){ global.openedWS[myevent.id].close(); }
			//console.log('opening socket: ' + wsUrl);
			var ws = new WebSocket(wsUrl);
			ws.on('open', function() {
		    //console.log('socket connected.');
		    ws.send('42["subscribe",{"Topic":"'+ matchId +'","LiveUpdates":"true","OddsUpdates":"true","VideoUpdates":"true","ConditionsUpdates":"true"}]');
		    global.openedWS[myevent.id] = ws;
		  });
		  ws.on('close', function close() {
			  //console.log('socket disconnected.');
			});
		  ws.on('message', function(msg){
		  	if(msg.indexOf('42[')!=0) return;
		  	//console.log('\n\n***************************\n\n');
		  	var regexEID = msg.match(/EID.*\d+/g);
		  	if(!regexEID) return;
		  	var actionId = parseInt(regexEID[0].split(':')[1]);
		  	//console.log("actionId: " + actionId);
		  	var actionName = BFCodes.getEvent(actionId);
		  	//console.log("actionName: " + actionName);
		  	//if(callback) callback(eventName,eventId);
		  	Fiber(function(){
		  		if(actionName){
		  			var safeActions = [1051,2075,1053,2077,1055,2079,132,1043,1044,2067,2068,10001,1040,2064];
		  			var safeGame = false;
		  			if(safeActions.indexOf(actionId)>=0){
		  				safeGame = true;
		  			}
		  			Events.update({id: myevent.id},{$set: {actionId: actionId, actionName: actionName, safeGame: safeGame}});
		  		}
		  	}).run();
		  });
		}).run();
	};
	
	if(global.intervalWS[myevent.id]) Meteor.clearInterval(global.intervalWS[myevent.id]);
	global.intervalWS[myevent.id] = Meteor.setInterval( function () {
    //console.log("refreshing socket...");
		wsConnectFn();
  }, refreshSocketInterval);

  wsConnectFn();

	//return { matchId: matchId, wsUrl: wsUrl };

	return true;

}




Meteor.methods({

	readFromSocket: function(eventId){
		Fiber(function(){
			var myevent = Events.findOne({id: eventId});
			if(myevent==null){
				console.log("could not find the event");
				return false;
			}
			if(myevent.wsUrl==null){
				console.log("could not find the events websocket");
				return false;
			}
			monitorLiveEventsBot(myevent);
		}).run();
		return { res: "success" };
	}

});


