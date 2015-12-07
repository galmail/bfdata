// run.js

Template.run.helpers({

	safeGameSignal: function(){
		var res = "";
		var eventId = Session.get('eventId');
		var greenLight = (eventId && Events.findOne({id: eventId}).safeGame);
		if(greenLight) res = "success";
		return res;
	},

	priceDropSignal: function(){
		var res = "";
		var greenLight = false;
		if(greenLight) res = "success";
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
		var eventId = Session.get('eventId');
		if(eventId){
			return Events.findOne({id: eventId}).actionName;
		}
	}

});

Template.run.events({



	"click #loadWsBtn": function(){
		// get eventId and marketId
		var eventId = $('#eventId').val();
		Session.set('eventId',eventId);
		//var marketId = $('#marketId').val();

		console.log("loading ws for eventId=" + eventId);
    Meteor.call("startWsCollection", eventId, function(error, res) {
      if(error){
      	console.log("error",error);
      	return false;
      }
    });
    return false;
  },

  "click #startBtn": function(){
  	var eventId = $('#eventId').val();
  	Session.set('eventId',eventId);
  	Meteor.call("readFromSocket", eventId, function(error, res) {
    	if(error){
    		console.log("error",error);
    		return false;
    	}
    	console.log("res",res);
    });
  }
  

});