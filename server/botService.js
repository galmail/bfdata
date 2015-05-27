// botService.js

var collectMarketData = function(bot){
  console.log("Collecting Market Data...");

  var runBatch = function(marketIds){
    console.log("\nRunning Batch of " + marketIds.length + ".\n");
    bot.listMarketBook(
      { marketIds: marketIds },
      function(err,res){
        if(err){
          console.log("ERROR: ",err);
          return false;
        }
        console.log("\nGot " + res.response.result.length + " market data!!!");
        Fiber(function(){
          var marketBooks = res.response.result;
          console.log("Got " + marketBooks.length + " market data!!!\n");
          _.each(marketBooks, function(marketBook) {
            //console.log("Saving marketbook for ID=" + marketBook.marketId);
            // manipulate date
            marketBook.lastMatchTime = new Date(marketBook.lastMatchTime);
            // create collection if doesnt exist
            if(!MarketData[marketBook.marketId]){
              MarketData[marketBook.marketId] = new Mongo.Collection("marketdata-"+marketBook.marketId);
            }
            MarketData[marketBook.marketId].upsert({ lastMatchTime: marketBook.lastMatchTime, marketId: marketBook.marketId },marketBook);
            // saving just for logs..
            //Logs.upsert({ lastMatchTime: marketBook.lastMatchTime, marketId: marketBook.marketId },marketBook);
          });
        }).run();
      }
    );
  };

  bot.listMarketCatalogue(
    { maxResults: "1000", filter: { eventTypeIds: ["1"], inPlayOnly: true } },
    function(err,res){
      if(err){
        console.log("ERROR: ",err);
        return false;
      }
      var markets = res.response.result;
      console.log("\nGettting data from " + markets.length + " markets...\n");
      var marketIds = [];
      for(var i=0;i<markets.length;i++){
        marketIds.push(markets[i].marketId);
        if((i+1)%50==0){
          runBatch(_.clone(marketIds));
          marketIds = [];
        }
      }
      if(marketIds.length>0){
        runBatch(_.clone(marketIds));
        marketIds = [];
      }
    }
  );
};

var collectEvents = function(bot){
  console.log("Collecting Events...");
  var d = new Date();
  d.setDate(d.getDate()-1);
  bot.listEvents(
    { filter: { eventTypeIds: ["1"], marketStartTime: {from: d.toISOString()} } },
    function(err,res){
      if(err){
        console.log("ERROR: ",err);
        return false;
      }
      var events = res.response.result;
      console.log("Saving " + events.length + " Events.");
      _.each(events, function(obj) {
        var event = obj.event;
        // collect market catalogue for each event
        bot.listMarketCatalogue(
          { filter: { eventIds: [event.id] }, maxResults: "100" },
          function(err,res){
            if(err){
              console.log("ERROR: ",err);
              return false;
            }
            event.markets = res.response.result;
            event.openDate = new Date(event.openDate);
            Fiber(function(){
              Events.upsert({id: event.id}, event);
            }).run();
          }
        );
      });
    }
  );
};

var stopBot = function(botConfig){
  console.log("Stoping Bot...");
  clearInterval(RunningBots[botConfig.task]);
};

var startBot = function(botConfig){
  console.log("Starting Bot...");
  var bot = Betfair.newSession(botConfig.appKey);
  bot.login(botConfig.username,botConfig.password, function(err){
    console.log(err ? "Login failed " + err : "Login OK");
    if(err) return false;
    switch(botConfig.task){
      case "collect-market-books":
          collectMarketData(bot);
          RunningBots[botConfig.task] = setInterval(function(){
            console.log('running bot: ' + botConfig.task);
            collectMarketData(bot);
          },botConfig.interval*1000);
          break;
      case "collect-events":
          collectEvents(bot);
          break;
      default:
          console.log("no task specified...");
    };
  });
};


Meteor.methods({

	test: function () {
    // this.unblock();
    // return Meteor.http.call("GET", "http://search.twitter.com/search.json?q=perkytweets");
    return { result: "success" };
  },

  runBot: function(botId){
    botId = parseInt(botId);
    var bot = Bots.findOne({id: botId});
    if(bot.status == "active"){
      Bots.update({id: botId},{$set: { status: "inactive"}});
      stopBot(bot);
    }
    else {
      Bots.update({id: botId},{$set: { status: "active"}});
      startBot(bot);
    }
    return { result: "success" };
  }

  // getMarketData: function(marketId){
  //   var res = [];
  //   console.log('marketID:'+marketId);
  //   if(!MarketData[marketId])
  //     MarketData[marketId] = new Mongo.Collection("marketdata-"+marketId);
  //     res = MarketData[marketId].find().fetch();
  //     console.log('got total data points: '+ res.length);
  //   }
  //   return { data: res };
  // }

});