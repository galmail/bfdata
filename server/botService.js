// botService.js

Meteor.methods({

	test: function () {
    // this.unblock();
    // return Meteor.http.call("GET", "http://search.twitter.com/search.json?q=perkytweets");
    return { result: "success" };
  },

  runBot: function(botId){
    var botConfig = Bots.findOne({_id: botId});
    if(botConfig.status == "active"){
      Bots.update({_id: botId},{$set: { status: "inactive"}});
      botConfig.stop();
    }
    else {
      Bots.update({_id: botId},{$set: { status: "active"}});
      botConfig.start();
    }
    return { result: "success" };
  }

});