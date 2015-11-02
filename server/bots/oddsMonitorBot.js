// oddsMonitorBot.js
//
// This bot will monitor the odds on certain markets and will alert "back signal" on a market when:
// 1. The odds to "back" under x goals is less than 1.10
// 2. The spread is small: |back-lay|=0.01
// 3. The available volume on back or lay is more than 200 pounds.
// 4. The odds are dropping faster on that market.



// 5. That market is "safe": totalGoals < marketGoals - 1


__min_market_odds__ = 1.15;
__max_spread__ = 0.03;
__min_odd_speed__ = 60000; // 60 sec just for testing...


oddsMonitorBot = function(bot,superCallback){
	//console.log('*** oddsMonitorBot Starting ***');

	// Get the in-play markets
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
      maxResults: "40",
      sort: "MAXIMUM_TRADED"
    },
    function(err,res){
      if(err){
        console.log("ERROR listMarketCatalogue: ",err);
        return false;
      }
      var markets = res.response.result;
      var marketIds = _.map(markets,function(market){ return market.marketId; });

      //console.log("num markets: "+marketIds.length);
      
      bot.listMarketBook(
	      {
	      	marketIds: marketIds,
	      	priceProjection: {priceData: ["EX_BEST_OFFERS"]}
	      },
	      function(err,res){
	        if(err){
	          console.log("ERROR listMarketBook: ",err);
	          return false;
	        }
	        var marketBooks = res.response.result;
	        var _marketsToFinish = marketBooks.length;
	        var done = function(){
	        	_marketsToFinish--;
	        	if(_marketsToFinish<=0){
	        		//console.log('*** oddsMonitorBot Finished ***');
	        		if(superCallback) superCallback();
	        		return true;
	        	}
	        	return false;
	        };

	        if(marketBooks.length == 0) return done();

	        var marketIsCold = function(marketId){
						//console.log("Market " + marketId + " is cold!!!");
						Fiber(function(){
							Markets.upsert({marketId: marketId}, {$set: {
								hot: false,
								offTarget: new Date()
							}});
							//stopPlaceOrderBot(bot,marketId);
							stopLiveEventsMonitorBot(bot,marketId);
						}).run();
						return done();
					};

	        _.each(marketBooks,function(marketBook){
		        Fiber(function(){

		        	var mymarket = Markets.findOne({marketId: marketBook.marketId});
		        	//console.log("Market: " + mymarket.marketName);

			        if(marketBook.status == "CLOSED" || marketBook.status == "SUSPENDED"){
			        	//console.log("The market is closed!");
			        	return marketIsCold(marketBook.marketId);
			        }

			        if(mymarket.isNotSafe){
    						return marketIsCold(marketBook.marketId);
    					}

    					// JUST FOR TESTING, REMOVE THIS!!!
    					// if(!mymarket.liveEventsMonitor){
    					// 	startLiveEventsMonitorBot(bot,mymarket.marketId);
    					// }
    					// else {
    					// 	return marketIsCold(marketBook.marketId);
    					// }

			        
			        var lastPriceTraded = marketBook.runners[0].lastPriceTraded;
			        //console.log("LastPriceTraded: " + lastPriceTraded);

			        if(lastPriceTraded > __min_market_odds__){
			        	//console.log("The market odds are greater than " + __min_market_odds__);
			        	return marketIsCold(marketBook.marketId);
			        }
		        	
		        	if(marketBook.runners[0].ex.availableToBack[0]==null || marketBook.runners[0].ex.availableToBack[0].price==null){
		        		//console.log("The market cannot be backed.");
		        		return marketIsCold(marketBook.marketId);
		        	}
	        		
	        		var toBack = marketBook.runners[0].ex.availableToBack[0].price;
	        		console.log(mymarket.marketName + ": ToBack=" + toBack);

		        	if(marketBook.runners[0].ex.availableToLay[0]==null || marketBook.runners[0].ex.availableToLay[0].price==null){
		        		//console.log("The market cannot be layed.");
		        		return marketIsCold(marketBook.marketId);
		        	}
	        		
	        		var toLay = marketBook.runners[0].ex.availableToLay[0].price;
	        		console.log(mymarket.marketName + ": ToLay=" + toLay);
		        	
		        	if(Math.abs(toBack-toLay) >= __max_spread__){
		        		//console.log("Market Spread is too much: " + Math.abs(toBack-toLay));
		        		return marketIsCold(marketBook.marketId);
		        	}
		        	
        			if(mymarket.lastPrice == null){
        				// save price and time
        				//console.log("..saving lastPrice = " + lastPriceTraded);
			          Markets.upsert({marketId: mymarket.marketId}, {$set: {lastPrice: lastPriceTraded, lastTime: new Date()}});
			          return marketIsCold(marketBook.marketId);
        			}
        			
      				console.log(mymarket.marketName + " last price: " + mymarket.lastPrice);

      				if(lastPriceTraded >= mymarket.lastPrice){
      					return done();
      				}
      					
    					var newOddSpeed = new Date() - mymarket.lastTime;
  						// save it
  						console.log(mymarket.marketName + "..saving newOddSpeed = " + newOddSpeed + " , lastPrice = " + lastPriceTraded);
    					Markets.upsert({marketId: mymarket.marketId}, {$set: {
    						lastPrice: lastPriceTraded,
    						lastTime: new Date(),
    						oddSpeed: newOddSpeed
    					}});

    					if(newOddSpeed > __min_odd_speed__){
      					return marketIsCold(mymarket.marketId);
    					}

    					if(mymarket.liveEventsMonitor || mymarket.hot){
      					return done();
    					}

    					// the market is hot now... let's make sure the market is safe.
    					var eventUrl = "https://www.betfair.com/sport/football/event?eventId=" + mymarket.event.id;
    					Meteor.http.get(eventUrl, function (error, result) {
					      if(error || result.statusCode != 200) {
					        console.log('http eventUrl get FAILED!');
					        return done();
					      }
				      	try {
				      		var htmlText = result.content;
					      	var homeScore = document.getElementsByClassName("home-score ui-score-home")[0].innerHTML;
					      	var awayScore = document.getElementsByClassName("away-score ui-score-away")[0].innerHTML;
					      	var totalGoals = parseInt(homeScore)+parseInt(awayScore);
					      	var marketGoals = parseFloat(mymarket.marketName.split(" ")[1]);
					      	if(totalGoals+1 > marketGoals){
					      		// market is not safe!
					      		Markets.upsert({marketId: mymarket.marketId}, {$set: { isNotSafe: true }});
					      		return marketIsCold(mymarket.marketId);
					      	}
					      	console.log(mymarket.marketName + " is hot!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
	    						// save it
	      					Markets.upsert({marketId: mymarket.marketId}, {$set: {
	      						hot: true,
	      						onTarget: new Date()
	      					}});
	      					///////// IT'S SHOW TIME //////////
	      					startPlaceOrderBot(bot,mymarket.marketId);
	      					startLiveEventsMonitorBot(bot,mymarket.marketId);
	      					return done();
				      	}
				      	catch(ex){
				      		return done();
				      	}
					    });
      				
		        }).run();
	        });
	      }
	    );
    }
  );

};


