// bots.js

Bots = new Meteor.Collection("bots",
{
    transform:function(entry)
    {
            
        entry.start = function(){
        	console.log("Starting Bot: " + this.task);
        	var self = this;
				  var bot = Betfair.newSession(this.appKey);
				  bot.login(this.username,this.password, function(err){
				    console.log(err ? "Login failed " + err : "Login OK");
				    if(err) return false;
				    switch(self.task){
				      case "collect-market-books":
			      		console.log("collect market books every: " + self.interval + " seconds.");
			          runCollectMarketData(bot);
			          RunningBots[self._id] = setInterval(function(){
			            runCollectMarketData(bot);
			          },self.interval*1000);
			          break;
				      case "collect-events":
			      		console.log("collect events every: " + self.interval + " seconds.");
			          runCollectEvents(bot);
			          RunningBots[self._id] = setInterval(function(){
			          	runCollectEvents(bot);
			          },self.interval*1000);
			          break;
				      default:
			          console.log("no task specified...");
				    };
				  });
        };

        entry.stop = function(){
        	console.log("Stopping Bot ID: " + this._id);
        	clearInterval(RunningBots[this._id]);
        };

        return entry;
    }
});