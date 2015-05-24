// bot.js
//var Betfair = Meteor.npmRequire('betfair');

Meteor.methods({
	test: function () {
    // this.unblock();
    // return Meteor.http.call("GET", "http://search.twitter.com/search.json?q=perkytweets");
    return { result: "success" };
  },
  loadBots: function () {
    return { bots: Meteor.settings.bf.bots };
  },
  startBot: function(index){
    var bfCredentials = Meteor.settings.bf.bots[index];
		var bot = Betfair.newSession(bfCredentials.appKey);
		bot.login(bfCredentials.username,bfCredentials.password, function(err){
	    console.log(err ? "Login failed " + err : "Login OK");
      if(err) return false;
      // Get MarketCatalogueList for inPlay
      // Soccer: EventType = 1
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
              var marketBooks = res.response.result;
              Fiber(function(){
                for(var j=0;j<marketBooks.length;j++){
                  MarketBooks.insert(marketBooks[j]);
                }
              }).run();
            }
          );
		    }
      );
    });
    return { result: "success" };
  }
});