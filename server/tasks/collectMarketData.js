// collectMarketData.js

runCollectMarketData = function(bot){
  
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




