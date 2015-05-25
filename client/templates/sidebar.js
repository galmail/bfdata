// sidebar.js

Template.sidebar.helpers({
	events: function(){
		return Events.find();
	},
	isActive: function(){
		var res = "";
		if (Session.get('ActiveEvent') && Session.get('ActiveEvent').id == this.id) res = "active";
		return res;
	}
});
