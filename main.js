if (Meteor.isClient) {
  // code to run on client at startup
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    
    ////////// LOGIN ON STARTUP //////////

		// var session = betfair.newSession(APP_KEY);
		// session.login(USERNAME,PASSWORD, function(err) {
		//   if(!err){
		//     session._logged = true;
		//     stats.setSession(session);
		//   }
		// });




  });
}
