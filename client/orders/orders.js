Template.orders.helpers({

  orders: function(){
    return Orders.find({},{sort:{placedTime:-1}});
  },

  marketId: function(){
  	return Session.get("marketId");
  },

  betDelay: function(){
  	var market = Markets.findOne({_id: Session.get("marketId")});
  	if(market) return market.betDelay;
  }



});


Template.orders.events({

	"click #cancelAllOrders": function(event){
		console.log("cancel all orders");
		Meteor.call("cancelAllOrders",function(err,res){});
	},

	"click #startQueue": function(event){
		console.log("starting queue.");
		Meteor.call("startQueue",Session.get("marketId"),function(err,res){});
	},

	"click #stopQueue": function(event){
		console.log("stoping queue.");
		Meteor.call("stopQueue",Session.get("marketId"),function(err,res){});
	}

});



