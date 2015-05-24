// main.js

/////// ROUTES ///////

Router.route('/', function () {
  this.render('dashboard');
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

