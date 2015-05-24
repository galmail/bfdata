// Provide defaults for Meteor.settings

if (typeof Meteor.settings === 'undefined')
  Meteor.settings = {};

_.defaults(Meteor.settings, {
  bf: {
    bots: [
      {
        index: 0,
        task: "collect-market-books",
        appKey: "8GM3PavYlsoCq5Pm",
        appKeyDelay: "nY91upd309Q9zbai",
        username: "guli@tocarta.es",
        password: "guliguli1"
      },
      {
        index: 1,
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
