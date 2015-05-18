// Provide defaults for Meteor.settings

if (typeof Meteor.settings === 'undefined')
  Meteor.settings = {};

_.defaults(Meteor.settings, {
  bf: {
  	appKey: "8GM3PavYlsoCq5Pm",
  	appKeyDelay: "nY91upd309Q9zbai",
  	username: "guli@tocarta.es",
  	password: "guliguli1"
  },
  twitter: {
    consumerKey: "PLfrg2bUh0oL0asi3R2fumRjm", 
    secret: "sRI8rnwO3sx7xUAxNWTX0WEDWph3WEBHu6tTdJYQ5wVrJeVCCt"
  }
});

// ServiceConfiguration.configurations.upsert(
//   { service: "twitter" },
//   {
//     $set: {
//       consumerKey: Meteor.settings.twitter.consumerKey,
//       secret: Meteor.settings.twitter.secret
//     }
//   }
// );
