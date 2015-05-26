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

Router.route('/bots');
Router.route('/about');
Router.route('/logs');

/////// COLLECTIONS ///////

Logs = new Mongo.Collection("logs");
Events = new Mongo.Collection("events");
Bots = new Mongo.Collection("bots");

if (Meteor.isClient) {
  // code to run on client at startup

}

if (Meteor.isServer) {
  Meteor.startup(function(){
    MarketData = []; // array of collections
    Bots.update({},{$set: {status: 'inactive'}},{multi:true});
    /////// SERVER-SIDE LIBRARIES ///////
  	Betfair = Meteor.npmRequire('betfair');
  	Fiber = Meteor.npmRequire('fibers');
  });
}

