// lookForGamesBot.js
//
// This bot check for every in-play football game on Betfair.
// If the game is "on-target" then it starts the oddsMonitorBot
// A game is "on-target" when:
//
// 1. It is a game in the selected competitions: Champions League, UEFA League, Spanish League, English League, Italian League, German League and French League.
// 2. Goal Markets for Over/Under 1.5, 2.5, 3.5 are open.
// 3. The game can be monitored using the LiveEventsBot (it has a live socket)
//

__eventIds__ = ["27552949"];

__competitionIds__ = [];

__competitionIds2__ = [
  
  ////////////// International //////////////

  "2005",               // UEFA Europa League
  "228",                // UEFA Champions League
  
  ////////////// United Kingdom //////////////

  "31",                 // Barclays Premier League
  "7129730",            // The Championship
  "35",                 // League One
  "37",                 // League Two

  ////////////// Spain //////////////

  "117",                // Primera Division
  "119",                // Segunda Division

  ////////////// Italy //////////////

  "81",                 // Serie A
  "83",                 // Serie B

  ////////////// Germany //////////////

  "59",                 // Bundesliga 1
  "61",                 // Bundesliga 2

  ////////////// France //////////////

  "59",                 // Ligue 1
  "61"                  // Ligue 2
];

lookForGamesBot = function(bot,superCallback){
  console.log('*** lookForGamesBot Starting ***');
  bot.listMarketCatalogue(
    {
      filter: {
    	 eventTypeIds: ["1"], 		// Soccer
    	 inPlayOnly: true,				// In-Play Only
       eventIds: __eventIds__,
       competitionIds: __competitionIds__,
       marketTypeCodes: ["OVER_UNDER_15","OVER_UNDER_25", "OVER_UNDER_35", "OVER_UNDER_45", "OVER_UNDER_55", "OVER_UNDER_65", "OVER_UNDER_75", "OVER_UNDER_85"]
      },
      marketProjection: ["COMPETITION", "EVENT","RUNNER_DESCRIPTION"],
      maxResults: "100"
    },
    function(err,res){
      if(err){
        console.log("ERROR: ",err);
        return false;
      }
      var markets = res.response.result;
      console.log("Got " + markets.length + " Markets In-Play.");
      var liveEventIds = [];
      _.each(markets, function(market) {
        // save the market
        var event = market.event;
        event.openDate = new Date(event.openDate);
        Fiber(function(){
          if(Events.findOne({id: event.id})==null){
            Events.insert(event);
          };
          if(Markets.findOne({marketId: market.marketId})==null){
            Markets.insert(market);
          };
          if(liveEventIds.indexOf(event.id) == -1)
            liveEventIds.push(event.id);
        }).run();
      });
      
      // fetch websocket for the live events.
      
      var wsCollectFn = function(i){
        if(i >= liveEventIds.length){
          console.log('*** lookForGamesBot Finished ***');
          if(superCallback) superCallback();
          return;
        }
        Fiber(function(){
          var event = Events.findOne({id: liveEventIds[i]});
          if(event.wsUrl == null){
            runWsCollector(liveEventIds[i],function(){
              i++;
              if(i<liveEventIds.length){
                wsCollectFn(i);
              }
            });
          }
          else {
            wsCollectFn(i+1);
          }
        }).run();
      };

      Fiber(function(){
        Meteor.setTimeout(function(){
          wsCollectFn(0);
        },2000);
      }).run();

    }
  );

};
