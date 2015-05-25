// dashboard.js

Template.dashboard.helpers({

	events: function(){
		return Events.find();
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



