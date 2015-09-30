// liveEventsMonitorBot.js
//
// Given a WebSocket, this bot will listen to in-play game events such as "Throw-In", "Kickoff", "Offside", ..
// The bot will send an alert when the game is "safe", which means, low chances of goal.
// If there is a goal, mark the first market as "unsafe".

startLiveEventsMonitorBot = function(bot,marketId){
	Fiber(function(){
		// if already started, just exit..
		var mymarket = Markets.findOne({marketId: marketId});
		if(mymarket.liveEventsMonitor){
			return false;
		}
		console.log('*** StartLiveEventsMonitorBot Starting ***');
		Markets.upsert({marketId: marketId}, {$set: {liveEventsMonitor: true}});
		var myevent = Events.findOne({id: mymarket.event.id});
		if(myevent.wsUrl==null){
			console.log('cannot monitor live events... wsUrl not found!');
			console.log('*** StartLiveEventsMonitorBot Finished ***');
			return;
		}
		monitorLiveEventsBot(myevent,false,function(action){
			console.log("action: " + action);
			//if(action == "Throw-In"){ ... }
		});
		console.log('*** StartLiveEventsMonitorBot Finished ***');
	}).run();
};

stopLiveEventsMonitorBot = function(bot,marketId){
	Fiber(function(){
		// if not started, just exit..
		var mymarket = Markets.findOne({marketId: marketId});
		if(!mymarket.liveEventsMonitor){
			return false;
		}
		console.log('*** StopLiveEventsMonitorBot Starting ***');
		Markets.upsert({marketId: marketId}, {$set: {liveEventsMonitor: false}});
		var myevent = Events.findOne({id: mymarket.event.id});
		console.log("killing the socket...");
		monitorLiveEventsBot(myevent,true);
		console.log('*** StopLiveEventsMonitorBot Finished ***');
	}).run();
};