// oddsMonitorBot.js
//
// This bot will monitor the odds on certain markets and will alert "back signal" on a market when:
// 1. The odds to "back" under x goals is less than 1.10
// 2. The spread is small: |back-lay|=0.01
// 3. The available volume on back or lay is more than 200 pounds.
// 4. The odds are dropping faster on that market.



// 5. That market is "safe": totalGoals < marketGoals - 1


oddsMonitorBot = function(bot,superCallback){
	console.log('*** oddsMonitorBot Starting ***');
	// Get the in-play markets
	bot.listMarketCatalogue(
    {
      filter: {
    	 eventTypeIds: ["1"], 		// Soccer
    	 inPlayOnly: true,				// In-Play Only
    	 
       competitionIds: [
    		
    		////////////// International //////////////

    		"2005", 							// UEFA Europa League
    		"228",								// UEFA Champions League
    		
    		////////////// United Kingdom //////////////

    		"31",									// Barclays Premier League
    		"7129730",						// The Championship
    		"35",									// League One
    		"37",									// League Two

    		////////////// Spain //////////////

    		"117",								// Primera Division
    		"119",								// Segunda Division

    		////////////// Italy //////////////

    		"81",									// Serie A
    		"83",									// Serie B

    		////////////// Germany //////////////

    		"59",									// Bundesliga 1
    		"61",									// Bundesliga 2

    		////////////// France //////////////

    		"59",									// Ligue 1
    		"61"									// Ligue 2
    	 ],
       
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
      var marketIds = _.map(markets,function(market){ return market.marketId; });
      
      bot.listMarketBook(
	      {
	      	marketIds: marketIds,
	      	priceProjection: {priceData: ["SP_AVAILABLE", "SP_TRADED", "EX_BEST_OFFERS", "EX_ALL_OFFERS", "EX_TRADED"]}
	      },
	      function(err,res){
	        if(err){
	          console.log("ERROR: ",err);
	          return false;
	        }
	        var marketBooks = res.response.result;
	        _.each(marketBooks,function(marketBook){
		        // check that the odds to "back" under x goals is less than 1.10
		        if(marketBook.status != "CLOSED" && marketBook.runners[0].lastPriceTraded <= 1.10 && marketBook.runners[0].lastPriceTraded > 1.01){
		        	// check that the spread is small: |back-lay|=0.01
		        	var toBack = null; var toLay = null;
		        	var toBackVol = null; var toLayVol = null;
		        	var lastPriceTraded = marketBook.runners[0].lastPriceTraded;
		        	if(marketBook.runners[0].ex.availableToBack[0]!=null){
		        		toBack = marketBook.runners[0].ex.availableToBack[0].price;
		        		toBackVol = marketBook.runners[0].ex.availableToBack[0].size;
		        	}
		        	if(marketBook.runners[0].ex.availableToLay[0]!=null){
		        		toLay = marketBook.runners[0].ex.availableToLay[0].price;
		        		toLayVol = marketBook.runners[0].ex.availableToLay[0].size;
		        	}
		        	if(toBack!=null && toLay!=null && Math.abs(toBack-toLay)==0.01){
		        		// check that the available volume on back or lay is more than 200 pounds.
		        		if(toBackVol!=null && toLayVol!=null && (toBackVol>200 || toLayVol>200)){
		        			Fiber(function(){
			        			var mymarket = Markets.findOne({id: marketBook.marketId});
			        			if(mymarket.lastPrice == null){
			        				// save price and time
						          Markets.upsert({id: mymarket.marketId}, {$set: {lastPrice: lastPriceTraded, lastTime: new Date()}});
			        			}
			        			else {
			        				if(lastPriceTraded < mymarket.lastPrice){
			        					var newOddSpeed = new Date() - mymarket.lastTime;
			        					if(mymarket.oddSpeed != null && newOddSpeed <= mymarket.oddSpeed+1000 && newOddSpeed < 8000){



			        						///////// ACTIVATE BETTING BOT AND MONITOR LIVE EVENTS IT'S MONEY TIME //////////



			        					}
			        					else {
			        						// save it
				        					Markets.upsert({id: mymarket.marketId}, {$set: {
				        						lastPrice: lastPriceTraded,
				        						lastTime: new Date(),
				        						oddSpeed: newOddSpeed
				        					}});
			        					}
			        				}
			        			}
		        			}).run();
		        		}
		        	}
		        }
	        });
					console.log('*** oddsMonitorBot Finished ***');
					if(superCallback) superCallback();
	      }
	    );
    }
  );

};


