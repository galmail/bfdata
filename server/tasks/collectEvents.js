// collectEvents.js

runCollectEvents = function(bot){
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
