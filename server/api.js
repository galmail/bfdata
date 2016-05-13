// botService.js

Meteor.methods({

	test: function () {
    // return Meteor.http.call("GET", "http://search.twitter.com/search.json?q=perkytweets");
    return { result: "success" };
  },

  runBot: function(botId,betParams){
    var botConfig = Bots.findOne({_id: botId});
    if(botConfig.status == "active"){
      Bots.update({_id: botId},{$set: { status: "inactive"}});
      botConfig.stop();
    }
    else {
      Bots.update({_id: botId},{$set: { status: "active"}});
      botConfig.start(betParams);
    }
    return { result: "success" };
  },

  loadUpcomingMatches: function(eventId){
    runCollectEvents(TestBot2);
    return true;
  },

  startWsCollection: function(eventId){
    runWsCollector(eventId);
    return { res: "success" };
  },

  readFromSocket: function(eventId){
    Fiber(function(){
      var myevent = Events.findOne({id: eventId});
      if(myevent==null){
        console.log("could not find the event");
        return false;
      }

      if(myevent.wsUrl==null){
        runWsCollector(eventId,function(wsUrl){
          myevent.wsUrl = wsUrl;
          if(wsUrl) monitorLiveEventsBot(myevent);
        });
      }
      else {
        monitorLiveEventsBot(myevent);
      }
    }).run();
    return { res: "success" };
  },

  // To stop listening on the socket of that event
  stopReadingFromSocket: function(eventId){
    Fiber(function(){
      var myevent = Events.findOne({id: eventId});
      if(myevent==null || myevent.wsUrl==null){
        return false;
      }
      monitorLiveEventsBot(myevent,true);
    }).run();
    return { res: "success" };
  },

  readMarketBooks: function(eventId){
    runCollectMarketBooks(TestBot2,eventId);
    return true;
  },

  // To stop getting the market books of that event
  stopReadingFromMarketBooks: function(eventId){
    runCollectMarketBooks(TestBot2,eventId,true);
    return true;
  },

  updateEventScore: function(eventId){
    updateEventScore(eventId);
    return true;
  },

  cancelAllOrders: function(){
    BackLayQueue.cancelAllOrders();
    return true;
  },

  startQueue: function(marketId){
    BackLayQueue.start(marketId);
    return true;
  },

  stopQueue: function(marketId){
    BackLayQueue.stop(marketId,true);
    return true;
  },

  placeOrder: function(marketId,selectionId,price){
    BackLayQueue.placeOrder(marketId,"back",price,selectionId);
    return true;
  },

  startVirtualSports: function(){
    virtualSportsAgent.login();
    return { res: "success" };
  }





});