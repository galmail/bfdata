// dashboard.js

Template.dashboard.helpers({

	events: function(){
		var dates = [];
		return Events.find({},{reactive:false,limit:100,sort:{openDate:1}}).map(function(event){
			var day = event.openDate.getDate();
	    var month = event.openDate.getMonth() + 1;
	    var year = event.openDate.getFullYear();
	    var date = day + '/' + month + '/' + year;
			if(dates.indexOf(date)==-1){
				dates.push(date);
				event.groupedDate = date;
			}
			return event;
		});
	},

	activeMarkets: function(){
		var event = Session.get('ActiveEvent');
		if(event){
			return event.markets;
		}
		else {
			return [];
		}
	},

	activeEvent: function(){
		return Session.get('ActiveEvent');
	},

	isActive: function(){
		var res = "";
		if (Session.get('ActiveEvent') && Session.get('ActiveEvent').id == this.id) res = "active";
		return res;
	}
	
});
