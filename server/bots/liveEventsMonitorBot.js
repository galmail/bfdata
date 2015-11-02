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
		console.log("myevent: ",myevent);
		if(myevent.wsUrl==null){
			console.log('cannot monitor live events... wsUrl not found!');
			console.log('*** StartLiveEventsMonitorBot Finished ***');
			return;
		}
		monitorLiveEventsBot(myevent,false,function(action,actionId){
			console.log("action: " + action);
			if(actionId == 1029 || actionId == 1030 || actionId == 2053 || actionId == 2054){
				// TODO there has been a goal or it has been canceled...
			}
			if(actionId == 1051 || actionId == 2075){
				// Safe home/away
				// TODO It is safe to bet...
			}
			if(actionId == 1053 || actionId == 2077){
				// Goal Kick home/away
				// TODO It is safe to bet...
			}
			if(actionId == 1055 || actionId == 2079){
				// Substitutions home/away
				// TODO It is safe to bet...
			}
			if(actionId == 132){
				// Injury Break
				// TODO It is safe to bet...
			}
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