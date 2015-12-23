// main.js

/////// ROUTES ///////

Router.route('/', function(){
  Router.go('/run'); // by default show the run page
});


Router.route('/dashboard', function(){
  var event = null;
  if(this.params.query.eventId){
  	event = Events.findOne({id: this.params.query.eventId });
  }
  else {
  	var now = new Date();
  	event = Events.findOne({openDate: {$gte: now}},{sort:{openDate:1}});
  }
  if(event) Session.set('ActiveEvent',event);
  this.render('dashboard');
});

// Other Routes
Router.route('/bots');
Router.route('/test');
Router.route('/logs');
Router.route('/orders');
Router.route('/run');

// About Routes
Router.route('/about');
Router.route('/about/bfdata', function(){
  this.render('about-collecting-bfdata');
});
Router.route('/about/ingame', function(){
  this.render('about-ingame-alerts');
});
Router.route('/about/opportunities', function(){
  this.render('about-detecting-opportunities');
});
Router.route('/about/actions', function(){
  this.render('about-taking-actions');
});



/////// COLLECTIONS ///////

MarketData = []; // array of market data collections (one collection per market)


if (Meteor.isClient) {
  // code to run on client at startup

}



if (Meteor.isServer) {

  Meteor.startup(function(){

    // when server starts, all bots are always inactive.
    RunningBots = {};
    Bots.update({},{$set: {status: 'inactive'}},{multi:true});

    /////// SERVER-SIDE LIBRARIES ///////
  	Betfair = Meteor.npmRequire('betfair');
  	Fiber = Meteor.npmRequire('fibers');
    Phantom = Meteor.npmRequire('phantom');
    WebSocket = Meteor.npmRequire('ws');

    loadTestBot = function(callback){
      TestBot = Betfair.newSession(Meteor.settings.bf.testBot.appKey);
      TestBot.login(Meteor.settings.bf.testBot.username,Meteor.settings.bf.testBot.password, function(err){
        if(err){
          console.log("TestBot not logged!");
          if(callback) callback(false);
        }
        else {
          console.log("TestBot is Ready!");
          if(callback) callback(true);
        }
      });

      TestBot2 = Betfair.newSession(Meteor.settings.bf.testBot2.appKey);
      TestBot2.login(Meteor.settings.bf.testBot2.username,Meteor.settings.bf.testBot2.password, function(err){
        if(err){
          console.log("TestBot2 not logged!");
          if(callback) callback(false);
        }
        else {
          console.log("TestBot2 is Ready!");
          if(callback) callback(true);
        }
      });

    };

    loadTestBot();

  });


}

