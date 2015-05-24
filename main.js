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

if (Meteor.isClient) {
  // code to run on client at startup
}

if (Meteor.isServer) {
	// code to run on server at startup	
  Meteor.startup(function(){
  	Betfair = Meteor.npmRequire('betfair');
  	Fiber = Meteor.npmRequire('fibers');
  });
}

