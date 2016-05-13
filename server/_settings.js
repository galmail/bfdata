// Provide defaults for Meteor.settings

if (typeof Meteor.settings === 'undefined') Meteor.settings = {};

_.defaults(Meteor.settings, {
  
  // betfair settings
  bf: {
    virtualTrading: true,
    updateMarketInterval: 500,
    testBot2: {
      appKey: "---",
      username: "---",
      password: "---"
    }
  },
  
  // twitter settings
  twitter: {
    consumerKey: "---", 
    secret: "---"
  },

  mongolab: {
    apiKey: "---"
  }

});