// Provide defaults for Meteor.settings

if (typeof Meteor.settings === 'undefined') Meteor.settings = {};

_.defaults(Meteor.settings, {
  
  // betfair settings
  bf: {
    testBot: {
      appKey: "8GM3PavYlsoCq5Pm",
      username: "guli@tocarta.es",
      password: "guliguli1"
    },
    signals: {
      minPriceToTrade: 1.18,
      priceDropSpeedSignal: 8000 //min price should drop fast, less than 8sec. 
    }
  },
  
  // twitter settings
  twitter: {
    consumerKey: "PLfrg2bUh0oL0asi3R2fumRjm", 
    secret: "sRI8rnwO3sx7xUAxNWTX0WEDWph3WEBHu6tTdJYQ5wVrJeVCCt"
  },

  mongolab: {
  	apiKey: "wGtHOle0k7O745R7Z_7Emzr0bNGcDIb2"
  }

});
