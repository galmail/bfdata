Meteor.startup(function () {

	var betfair = Meteor.npmRequire('betfair');
	var session = betfair.newSession(Meteor.settings.bf.appKey);
	 
	session.login(Meteor.settings.bf.username,Meteor.settings.bf.password, function(err) {
	    console.log(err ? "Login failed " + err : "Login OK");
	    if(!err){


   		 	var invocation = session.listCountries({filter: {}}, function(err,res) {
			    if(err) {
			        console.log('listCountries failed',err);
			    } else {
			    		console.log(res.response.result);
			    }
				});


	    }
	});

});



