// main.js

Template.strategy1.helpers({

	loading: function(){	
		console.log("loading upcoming games...");
		return Meteor.call("loadUpcomingMatches");
	},

	betDelay: function(){
		return "----";
	},

	serverResponseTime: function(){
		var market = Markets.findOne({id: Session.get("marketId")});
		if(market && market.serverResponseTime) return market.serverResponseTime + "ms";
		else return "-----";
	},

	matchScore: function(){
		var event = Events.findOne({id: Session.get('eventId')});
		if(event==null || event.homeScore==null || event.awayScore==null) return "-----";
		return event.homeScore + " - " + event.awayScore;
	},

	currentMarket: function(){
		return Markets.findOne({id: Session.get("marketId")});
	},

	inPlayMatches: function(){
		var now = new Date();
		var threeHoursAgo = new Date(now.getTime() - (3 * 60 * 60 * 1000));
		return Events.find({openDate: {$gte: threeHoursAgo,$lte: now}},{ sort: {openDate: -1} });
	},

	safeGameSignal: function(){
		var res = "--";
		var event = Events.findOne({id: Session.get('eventId')});
		var greenLight = (event && event.safeGame);
		if(greenLight) res = "safe-game";
		return res;
	},

	priceSignal: function(){
		var res = "--";
		var market = Markets.findOne({id: Session.get("marketId")})
		if(market==null) return res;
		if(market.signals.maxPrice && market.signals.minPrice) res = "success";
		return res;
	},

	priceOverMinSignal: function(){
		var res = "--";
		var market = Markets.findOne({id: Session.get("marketId")})
		if(market==null) return res;
		if(market.signals.priceOverMinPrice) res = "success";
		return res;
	},

	lastTimeMinPriceTraded: function(){
		var res = "--";
		var market = Markets.findOne({id: Session.get("marketId")})
		if(market==null) return res;
		return ((new Date() - market.minPriceTradedTime)/1000).toFixed(2);
	},

	lastTimeMinPriceSignal: function(){
		var res = "--";
		var market = Markets.findOne({id: Session.get("marketId")})
		if(market==null) return res;
		if(market.signals.lastTimeMinPrice) res = "success";
		return res;
	},

	priceOscillationSignal: function(){
		var res = "--";
		var market = Markets.findOne({id: Session.get("marketId")})
		if(market==null) return res;
		if(market.signals.priceOscillation) res = "success";
		return res;
	},

	maxSpreadSignal: function(){
		var res = "--";
		var market = Markets.findOne({id: Session.get("marketId")})
		if(market==null) return res;
		if(market.signals.maxSpread) res = "success";
		return res;
	},

	trade: function(){
		return Trades.find({eventId: Session.get('eventId')}, { sort: {tradingStartTime: -1}});
	},

	minPriceSince: function(){
		var market = Markets.findOne({id: Session.get("marketId")})
		if(market==null) return "--";
		var secondsAgo = ((new Date() - market.minPriceTradedTime)/1000).toFixed(2);
		if(secondsAgo>60) return "60+";
		else return secondsAgo;
	},

	minPriceDelta: function(){
		var market = Markets.findOne({id: Session.get("marketId")})
		if(market==null) return "--";
		var delta = ((market.minPriceTradedTimeDelta)/1000).toFixed(2);
		if(delta>60) return "60+";
		else return delta;
	},

	priceDropSignal: function(){
		var res = "";
		var market = Markets.findOne({id: Session.get("marketId")})
		if(market==null) return res;
		if(market.signals.priceDropSpeedSignal) res = "success";
		return res;
	},

	priceBounceSignal: function(){
		var res = "";
		var greenLight = false;
		if(greenLight) res = "success";
		return res;
	},

	spreadSignal: function(){
		var res = "";
		var greenLight = false;
		if(greenLight) res = "success";
		return res;
	},

	lastPriceDrop: function(){
		return 2;
	},

	lastPriceBounce: function(){
		return 2;
	},

	spread: function(){
		return 2;
	},

	lastPriceMatched: function(){
		return 1.05;
	},

	minPriceMatched: function(){
		return 1.04;
	},

	action: function(){
		var event = Events.findOne({id: Session.get('eventId')});
		if(event){
			return event.actionName;
		}
		else return "------";
	}

});

Template.strategy1.events({

	"change #matchSelect": function(event){
	  var currentTarget = event.currentTarget;
	  var eventId = currentTarget.options[currentTarget.selectedIndex].value;
	  var event = Events.findOne({id: eventId});
	  if(event==null) return;

	  Meteor.call("stopReadingFromSocket", Session.get("eventId"),function(err,res){});
	  Meteor.call("stopReadingFromMarketBooks", Session.get("eventId"),function(err,res){});

	  Session.set("eventId",eventId);
	  console.log("Match Selected with eventId",eventId);

	  Meteor.call("readFromSocket", eventId, function(error, res) {
    	if(error){
    		console.log("error",error);
    		return false;
    	}
    	console.log("Reading From Socket Now...");
    });

	  Meteor.call("readMarketBooks", eventId, function(error, res) {
    	if(error){
    		console.log("error",error);
    		return false;
    	}
    	console.log("Reading Market Books Now...");
    });

    Meteor.call("updateEventScore",eventId);

	},

	"change .marketOption": function(event){
		var mId = event.target.id;
		var myevent = Events.findOne({id: Session.get("eventId")});
		if(myevent==null){
			event.target.checked='';
			return false;
		}
		console.log("Market Selected: " + mId);
  	for(var i=0;i<myevent.markets.length;i++){
    	var marketId = myevent.markets[i].marketId;
    	var marketName = myevent.markets[i].marketName;
    	if(marketName.indexOf("Over/Under "+mId)>=0){
    		Session.set("marketId",marketId);
    		return true;
    	}
    }
    // unselect this market cause it doesn't exist
    event.target.checked='';
	}

});