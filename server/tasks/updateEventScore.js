// updateEventScore.js

updateEventScore = function(eventId){
  console.log("Updating Event Score...");
  var eventUrl = "https://www.betfair.com/sport/football/event?eventId=" + eventId;
	Meteor.http.get(eventUrl, function (error, result) {
    if(error || result.statusCode != 200) {
      console.log('http eventUrl get FAILED!');
      return;
    }
  	try {
  		var htmlText = result.content;
      var homeScore = parseInt(htmlText.match(/<span class=\"home-score ui-score-home\".*span>/g)[0].match(/\d/)[0]);
      var awayScore = parseInt(htmlText.match(/<span class=\"away-score ui-score-away\".*span>/g)[0].match(/\d/)[0]);
    	var totalGoals = homeScore + awayScore;
    	Fiber(function(){
        Events.update({id: eventId},{ $set: { homeScore: homeScore, awayScore: awayScore, totalGoals: totalGoals } });
      }).run();
  	}
  	catch(ex){
      console.log('ERROR: ' + ex);
  		return;
  	}
  });
};