// Provide defaults for Meteor.settings

if (typeof Meteor.settings === 'undefined')
  Meteor.settings = {};

_.defaults(Meteor.settings, {
  bf: {
    bots: [
      {
        id: 0,
        task: "collect-market-books",
        appKey: "8GM3PavYlsoCq5Pm",
        appKeyDelay: "nY91upd309Q9zbai",
        username: "guli@tocarta.es",
        password: "guliguli1"
      },
      {
        id: 1,
        task: "collect-events",
        appKey: "KeGZIpaVaSugfWVp",
        appKeyDelay: "WZQ2fsGLELLVHVSu",
        username: "guli2@tocarta.es",
        password: "guliguli2"
      }
    ]
  },
  twitter: {
    consumerKey: "PLfrg2bUh0oL0asi3R2fumRjm", 
    secret: "sRI8rnwO3sx7xUAxNWTX0WEDWph3WEBHu6tTdJYQ5wVrJeVCCt"
  }
});

////////// BETFAIR BOTS //////////

Bots = new Mongo.Collection("bots");
_.each(Meteor.settings.bf.bots, function(bot) {
    Bots.update({id: bot.id}, {"$setOnInsert": bot}, {upsert: true});
});
