// dashboard.js

var dates = [];

Template.dashboard.helpers({

	events: function(){
		dates = [];
		return Events.find({},{limit:1000,sort:{openDate:1}}).fetch();
	},

	activeEvent: function(){
		return Session.get('ActiveEvent');
	},

	isActive: function(){
		var res = "";
		if (Session.get('ActiveEvent') && Session.get('ActiveEvent').id == this.id) res = "active";
		return res;
	},

	currentDate: function(){
		var day = this.openDate.getDate();
    var month = this.openDate.getMonth() + 1;
    var year = this.openDate.getFullYear();
    var date = day + '/' + month + '/' + year;
		if(dates.indexOf(date)==-1){
			dates.push(date);
			return date;
		}
		else {
			return "";
		}
	}
	
});
