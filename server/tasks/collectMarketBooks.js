// collectMarketBooks.js

global.intervalMB = [];

runCollectMarketBooks = function(bot,eventId,stop){
  console.log("Collecting Market Books for EventId: " + eventId);
  var myevent = Events.findOne({id: eventId});
  if(myevent==null) return;
  if(stop){
    global.intervalMB[myevent.id]=null;
  }
  else {
    global.intervalMB[myevent.id]=1;
  }

  var marketIds = [];
  for(var i=0;i<myevent.markets.length;i++){
    var marketId = myevent.markets[i].marketId;
    var marketName = myevent.markets[i].marketName;
    if(marketName.indexOf("Over/Under")>=0){
      marketIds.push(marketId);
      Fiber(function(){
        Markets.upsert({_id: marketId},{ $set: {
          _id: marketId,
          id: marketId,
          eventId: myevent.id,
          name: marketName
        }});
      }).run();
    }
  }

  var updateMarketBooks = function(callback){
    console.log("Updating Market Books for EventId: " + eventId);
    var refreshTime = new Date();
    bot.listMarketBook(
      {
        currencyCode: "GBP",
        locale: "en",
        marketIds: marketIds,
        priceProjection: {priceData: ["EX_BEST_OFFERS"]}
      },
      function(err,res){
        if(err){
          console.log("ERROR listMarketBook: ",err);
          return false;
        }
        var marketBooks = res.response.result;
        var totalMBs = marketBooks.length;
        var done = function(){
          totalMBs--;
          if(totalMBs==0){
            callback();
          }
        };
        _.each(marketBooks,function(marketBook){
          Fiber(function(){
            var market = Markets.findOne({_id: marketBook.marketId});
            if(market==null) return;
            marketBook.lastMatchTime = new Date(marketBook.lastMatchTime);
            marketBook.serverResponseTime = new Date() - refreshTime;
            Strategy1.trade(_.extend(market, marketBook));
            done();
          }).run();
        });
      }
    );
  };


  var repeater = function(){
    if(global.intervalMB[myevent.id]==1){
      Meteor.setTimeout(function(){
        updateMarketBooks(repeater);
      },Meteor.settings.bf.updateMarketInterval);
    }
  };

  repeater();

};




