// Provide defaults for Meteor.settings

if (typeof Meteor.settings === 'undefined')
  Meteor.settings = {};

_.defaults(Meteor.settings, {
  bf: {
    bots: [
      {
        index: 0,
        id: "Soccer Bot1",
        appKey: "8GM3PavYlsoCq5Pm",
        appKeyDelay: "nY91upd309Q9zbai",
        username: "guli@tocarta.es",
        password: "guliguli1"
      },
      {
        index: 1,
        id: "Soccer Bot2",
        appKey: "8GM3PavYlsoCq5Pt",
        appKeyDelay: "nY91upd309Q9zbas",
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
