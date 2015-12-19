// Strategy1.js

Strategy1 = {

	signals: {
		//TODO: check for enough liquidity...
		maxSpread: 0.01,          // checking max spread
		maxPrice: 1.18,						// price must be less than or equals 1.18 for under
		minPrice: 1.02,						// price must be at least 1.02 for under
		//priceOverMinPrice: true, 	// price must be greater than min price
		lastTimeMinPrice: 3000,		// last time price was exchanged at minPrice was no longer than 3sec ago
		priceOscillation: 2000,	  // price should change at least twice in the last 2sec. 
		safeGame: true						// the game is safe
	},

	trade: function(market){
		if(market.tradingInProgress){
      if(Meteor.settings.bf.virtualTrading){
        return Strategy1.monitorVirtualTrade(market);
      }
      else {
        return Strategy1.monitorTrade(market);
      }
    }
		var updatedMarket = Strategy1.checkSignals(market);
		if(updatedMarket==null || !updatedMarket.allSignalsGreen) return false;
		console.log("All signals are green!");
    updatedMarket.tradingStartTime = new Date();
    var entryPrice = parseFloat(updatedMarket.bestToBack + 0.01).toFixed(2);
    var exitPrice = parseFloat(updatedMarket.bestToBack).toFixed(2);

    // Create Trade Object.
    var tradeId = Trades.insert({
      eventId: updatedMarket.eventId,
      marketId: updatedMarket._id,
      tradingStartTime: updatedMarket.tradingStartTime,
      tradingEndTime: null,
      tradingStrategy: {
        entryPoint: {
          action: "back",
          price: entryPrice
        },
        exitPoint: {
          action: "lay",
          price: exitPrice
        }
      },
      marketSuspended: false,
      minPriceTraded: null,
      maxPriceTraded: null,
      result: null,
      virtual: Meteor.settings.bf.virtualTrading,
      backOrder: {
        price: null,
        orderPlacedTime: null,
        orderMatchedTime: null
      },
      layOrder: {
        price: null,
        orderPlacedTime: null,
        orderMatchedTime: null
      },
      status: "Created"
    });

    if(Meteor.settings.bf.virtualTrading){
      Markets.update({_id: updatedMarket._id},{ $set: { tradeId: tradeId, tradingInProgress: true, tradingStartTime: updatedMarket.tradingStartTime } });
    }

    if(entryPrice > 1.03 && entryPrice < 1.25 && !Meteor.settings.bf.virtualTrading){
      if(!updatedMarket.isHot){
        BackLayQueue.start(updatedMarket._id,tradeId);
      }
      else {
        //Markets.update({_id: updatedMarket._id},{ $set: { tradeId: tradeId, tradingInProgress: true, tradingStartTime: updatedMarket.tradingStartTime } });
        BackLayQueue.openTrade(updatedMarket._id,tradeId);
      }
    }

	},

  // Monitor Real-Money Trades, watching placed orders.
  monitorTrade: function(market){
    console.log("TODO implement monitor trade function...");
  },

  // Monitor Virtual Trades using prices only.
	monitorVirtualTrade: function(market){
    var trade = Trades.findOne({_id: market.tradeId});
    var lastPriceTraded = parseFloat(market.runners[0].lastPriceTraded);

    // after 5sec abort trade
    if(new Date() - trade.tradingStartTime >= 5000){
      if(trade.maxPriceTraded < parseFloat(trade.tradingStrategy.entryPoint.price)){
        console.log("trade never reached the entryPoint...");
        trade.result = "neutral";
      }
      else if((trade.maxPriceTraded >= parseFloat(trade.tradingStrategy.entryPoint.price)) && (trade.minPriceTraded = parseFloat(trade.tradingStrategy.entryPoint.price))){
        console.log("trade never reached the exitPoint, but did breakeven.");
        trade.result = "neutral";
      }
      else {
        console.log("trade failed.");
        trade.result = "failure";
      }
      Trades.update({_id: market.tradeId},{$set: { result: trade.result, tradingEndTime: new Date() }});
      Markets.update({_id: market._id},{ $set: { tradingInProgress: false } });
      //BackLayQueue.forceCloseTrade(market._id);
      return;
    }

    // if market closed or suspended, mark trade as a failure
    if(market.status == "CLOSED" || market.status == "SUSPENDED"){
      console.log("market closed or suspended...");
      Trades.update({_id: market.tradeId},{$set: { marketSuspended: true, result: "failure", tradingEndTime: new Date() }});
      Markets.update({_id: market._id},{ $set: { tradingInProgress: false } });
      //BackLayQueue.forceCloseTrade(market._id);
      return;
    }
    
    // setting min/max prices
    if(trade.minPriceTraded == null || lastPriceTraded < trade.minPriceTraded){
      trade.minPriceTraded = lastPriceTraded;
    }
    if(trade.maxPriceTraded == null || lastPriceTraded > trade.maxPriceTraded){
      trade.maxPriceTraded = lastPriceTraded;
    }
    
    // checking if result is success
    if((trade.maxPriceTraded >= parseFloat(trade.tradingStrategy.entryPoint.price)) && (trade.minPriceTraded <= parseFloat(trade.tradingStrategy.exitPoint.price))){
      console.log("trade is a success!");
      trade.tradingEndTime = new Date();
      trade.result = "success";
      Trades.update({_id: market.tradeId},{$set: trade });
      Markets.update({_id: market._id},{ $set: { tradingInProgress: false } });
      //BackLayQueue.closeTrade(market._id);
      return;
    }

    // update the trade object
    Trades.update({_id: market.tradeId},{$set: trade });
	},

	// check if all signals are green
	checkSignals: function(market){
		market.signals = {};

		// if market is closed, abort
		if(market.status == "CLOSED" || market.status == "SUSPENDED"){
      BackLayQueue.stop(market._id);
      return null;
    }
		// if market has not been traded, abort
		var lastPriceTraded = market.runners[0].lastPriceTraded;
		if(lastPriceTraded==null){
      BackLayQueue.stop(market._id);
      return null;
    }
    else if(lastPriceTraded <= Strategy1.signals.minPrice || lastPriceTraded > Strategy1.signals.maxPrice){
      BackLayQueue.stop(market._id);
    }

		// if market is unsafe, abort
		var marketGoals = parseFloat(market.name.split(" ")[1]);
		var totalGoals = Events.findOne({id: market.eventId}).totalGoals;
  	market.isSafe = true;
    if(totalGoals==null || (totalGoals!=null && totalGoals+1>marketGoals)){
  		market.isSafe = false;
      BackLayQueue.stop(market._id);
  		return null;
  	}

    if(market.lastPriceChangeTime==null){
      market.lastPriceChangeTime = new Date();
      market.numPriceChanges = 0;
    }
    
    if(market.lastPriceTraded != lastPriceTraded){
      if(new Date() - market.lastPriceChangeTime <= Strategy1.signals.priceOscillation){
        market.numPriceChanges++;
      }
      else {
        market.numPriceChanges=0;
      }
      market.lastPriceChangeTime = new Date();
    }
    else {
      if(new Date() - market.lastPriceChangeTime > Strategy1.signals.priceOscillation){
        market.numPriceChanges=0;
      }
    }
    market.signals.priceOscillation = (market.numPriceChanges>=2);

    // setting min/max price signals.
    market.lastPriceTraded = lastPriceTraded;
    market.signals.maxPrice = (market.lastPriceTraded <= Strategy1.signals.maxPrice);
    market.signals.minPrice = (market.lastPriceTraded >= Strategy1.signals.minPrice);

    // setting min price trade and price drop speed signals.
    if(market.minPriceTraded == null ){
      market.minPriceTraded = lastPriceTraded;
      market.minPriceTradedTime = new Date();
      market.minPriceTradedTimeDelta = 999999;
    }
    else if(lastPriceTraded < market.minPriceTraded){
      market.minPriceTraded = lastPriceTraded;
      market.minPriceTradedTimeDelta = new Date() - market.minPriceTradedTime;
      market.minPriceTradedTime = new Date();
    }
    else if(lastPriceTraded == market.minPriceTraded){
      market.minPriceTradedTime = new Date();
    }

    //market.signals.priceOverMinPrice = (market.lastPriceTraded > market.minPriceTraded);
    market.signals.lastTimeMinPrice = ((new Date() - market.minPriceTradedTime) <= Strategy1.signals.lastTimeMinPrice);
    //market.signals.priceDropSpeedSignal = (market.minPriceTradedTimeDelta <= Meteor.settings.bf.signals.priceDropSpeedSignal);

    // set spread..
    if(market.runners[0].ex.availableToBack[0] && market.runners[1].ex.availableToBack[0] && market.runners[0].ex.availableToLay[0] && market.runners[1].ex.availableToLay[0]){
      
      var bestToBack1 = parseFloat(market.runners[0].ex.availableToBack[0].price);
      var bestToBack2 = ((1.00/(parseFloat(market.runners[1].ex.availableToLay[0].price)-1.00))+1.00).toFixed(2);

      var bestToLay1 = parseFloat(market.runners[0].ex.availableToLay[0].price);
      var bestToLay2 = ((1.00/(parseFloat(market.runners[1].ex.availableToBack[0].price)-1.00))+1.00).toFixed(2);

      market.bestToBack = Math.max(bestToBack1,bestToBack2);
      market.bestToLay = Math.min(bestToLay1,bestToLay2);

      market.actualSpread = Math.abs(market.bestToLay-market.bestToBack).toFixed(2);

      market.signals.maxSpread = (market.actualSpread <= Strategy1.signals.maxSpread);
    }
    else {
      market.signals.maxSpread = false;
    }

  	market.signals.safeGame = Events.findOne({id: market.eventId}).safeGame;

  	market.allSignalsGreen = true;
  	_.each(market.signals, function(signal){
  		if(!signal) market.allSignalsGreen = false;
  	});

  	// save game!
  	Markets.update({_id: market._id},{ $set: market });

  	return market;
	}


};
