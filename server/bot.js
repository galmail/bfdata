// bot.js


var collectMarketData = function(bot){
  console.log("Collecting Market Data...");
  bot.listMarketCatalogue(
    { maxResults: "10", filter: { eventTypeIds: ["1"], inPlayOnly: true } },
    function(err,res){
      if(err) return false;
      var markets = res.response.result;
      var marketIds = [];
      for(var i=0;i<markets.length;i++){
        marketIds.push(markets[i].marketId);
      }
      // Get MarketBookList on the result
      bot.listMarketBook(
        { marketIds: marketIds },
        function(err,res){
          if(err) return false;
          Fiber(function(){
            var marketBooks = res.response.result;
            console.log("Saving " + marketBooks.length + " MarketBooks.");
            _.each(marketBooks, function(marketBook) {
              MarketBooks.update({id: marketBook.id}, {"$setOnInsert": marketBook}, {upsert: true});
            });
          }).run();
        }
      );
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
      if(err) return false;
        var events = res.response.result;
        console.log("Saving " + events.length + " Events.");
        _.each(events, function(obj) {
          var event = obj.event;
          // collect market catalogue for each event
          bot.listMarketCatalogue(
            { filter: { eventIds: [event.id] }, maxResults: "100" },
            function(err,res){
              if(err){
                console.log(err);
                return false;
              }
              event.markets = res.response.result;
              Fiber(function(){
                Events.update({id: event.id}, {"$setOnInsert": event}, {upsert: true});
              }).run();
            }
          );
        });
    }
  );
};

var stopBot = function(index){
  console.log("Stoping Bot...");
  Meteor.settings.bf.bots[index].status = "inactive";
};

var startBot = function(index){
  console.log("Starting Bot...");
  var bfCredentials = Meteor.settings.bf.bots[index];
  var bot = Betfair.newSession(bfCredentials.appKey);
  bot.login(bfCredentials.username,bfCredentials.password, function(err){
    console.log(err ? "Login failed " + err : "Login OK");
    if(err) return false;
    Meteor.settings.bf.bots[index].status = "active";
    switch(bfCredentials.task){
      case "collect-market-books":
          collectMarketData(bot);
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

  runBot: function(index){
    var bfCredentials = Meteor.settings.bf.bots[index];
    if(bfCredentials.status == "active"){
      stopBot(index);
    }
    else {
      startBot(index);
    }
    return { result: "success" };
  }

});