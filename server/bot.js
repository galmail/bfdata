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
		var bfBot = Meteor.settings.bf.bots[index];
		var session = Betfair.newSession(bfBot.appKey);
		session.login(bfBot.username,bfBot.password, function(err) {
	    console.log(err ? "Login failed " + err : "Login OK");
		});

		return { result: "success" };

  	// Soccer: EventType = 1
  	// Get MarketCatalogueList for inPlay
  	// Get MarketBookList for inPlay

  }
});