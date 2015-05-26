// main.js

/////// ROUTES ///////

Router.route('/', function () {
  var event = null;
  if(this.params.query.eventId){
  	event = Events.findOne({id: this.params.query.eventId });
  }
  else {
  	var now = new Date();
  	event = Events.findOne({openDate: {$gte: now}},{sort:{openDate:1}});
  }
  // setting the event in session
  if(event) Session.set('ActiveEvent',event);
  this.render('dashboard');
  //this.render('dashboard', { data: { activeEvent: event} });
});

Router.route('/status');
Router.route('/about');
Router.route('/logs');

/////// COLLECTIONS ///////

MarketBooks = new Mongo.Collection("marketbooks");
Events = new Mongo.Collection("events");

if (Meteor.isClient) {
  // code to run on client at startup
  Bots = new Mongo.Collection("bots");
}

if (Meteor.isServer) {
  Meteor.startup(function(){
  	
  	/////// SERVER-SIDE LIBRARIES ///////
  	Betfair = Meteor.npmRequire('betfair');
  	Fiber = Meteor.npmRequire('fibers');

  });
}

