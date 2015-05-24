// sidebar.js

Template.sidebar.helpers({
	events: function(){
		return Events.find();
	}
});
