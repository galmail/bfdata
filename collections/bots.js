// bots.js

Bots = new Meteor.Collection("bots",
{
    transform:function(entry)
    {
            
        entry.start = function(betParams){
        	console.log("Starting Bot: " + this.task);
        	var self = this;
        	RunningBots[self._id] = 0;
				  var bot = Betfair.newSession(this.appKey);
				  bot.login(this.username,this.password, function(err){
				    console.log(err ? "Login failed " + err : "Login OK");
				    if(err) return false;
				    switch(self.task){
				      case "collect-market-books":
			      		console.log("collect market books every second.");
			      		var oddsMonitorBotFn = function(){
			          	oddsMonitorBot(bot,function(){
			          		if(RunningBots[self._id] != -1)
			          			RunningBots[self._id] = setTimeout(oddsMonitorBotFn,1000);
			          	});
			          }
			          oddsMonitorBotFn();

			          // runCollectMarketData(bot);
			          // RunningBots[self._id] = setInterval(function(){
			          //   runCollectMarketData(bot);
			          // },self.interval*1000);
			          
			          break;
				      case "collect-events":
			      		console.log("collect games every 30 seconds.");
			          var gamesBotFn = function(){
			          	lookForGamesBot(bot,function(){
			          		if(RunningBots[self._id] != -1)
			          			RunningBots[self._id] = setTimeout(gamesBotFn,30000);
			          	});
			          }
			          gamesBotFn();
			          break;
			        case "place-bet":
			          runPlaceAndCancelOrder(bot,betParams);
			          break;
				      default:
			          console.log("no task specified...");
				    };
				  });
        };

        entry.stop = function(){
        	console.log("Stopping Bot ID: " + this._id);
        	clearInterval(RunningBots[this._id]);
        	clearTimeout(RunningBots[this._id]);
        	RunningBots[this._id] = -1;
        };

        return entry;
    }
});