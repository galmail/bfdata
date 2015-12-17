// socketCollector.js

//mongo_apikey = "wGtHOle0k7O745R7Z_7Emzr0bNGcDIb2";
//myurl = "https://www.betfair.com/sport/football/event?eventId=27450734";
jqScript = "http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js";

parsePage = function(page,_url,fnSelector,callback,args,includeJQuery){
	var url = encodeURI(_url);

	page.onConsoleMessage = function(msg) {
	  console.log("console",msg);
	};

	page.onResourceError = function(resourceError) {
    page.reason = resourceError.errorString;
    page.reason_url = resourceError.url;
	};

	page.onError = function(msg, trace) {
    console.log("page error:",msg);
	};

	page.open(url, function(status){

		if (status !== 'success'){
      console.log("Error opening url \"" + page.reason_url + "\": " + page.reason);
      //phantom.exit(1);
    } else {
      console.log("Successful page open!");
      // wait 2 seconds for the page to load...
      setTimeout(function(){
      	var fn = "function() { return (" + fnSelector.toString() + ").apply(this,"+ JSON.stringify(args) +");}";
      	if(includeJQuery){
      		page.includeJs(jqScript,function(){
	      		page.evaluate(fn,callback);
	      	});
      	}
      	else {
      		page.evaluate(fn,callback);
      	}
      },2000);
    }
	});
};

runWsCollector = function(eventId,callback){
	var url = "https://www.betfair.com/sport/football/event?eventId=" + eventId + "&action=openDataVisualization&modules=matchheader-new&action=openDataVisualization&sportId=1";
	var wsURL = null;
  console.log('open: ' + url);
  Phantom.create("--web-security=no", "--ignore-ssl-errors=yes",{},function (ph) {
	  ph.createPage(function (page) {
			parsePage(page,url,function(){
				try {
					var eventId = arguments[0];
					var frame1 = document.getElementsByClassName("player")[0];
					frame1 = (frame1.contentWindow || frame1.contentDocument);
					var frame2 = frame1.document.getElementById('playerFrame');
					frame2 = (frame2.contentWindow || frame2.contentDocument);
					var frame3 = frame2.document.getElementsByTagName('iframe')[0];
					return frame3.src;
				}
				catch(err){
					return null;
				}
			},function(res){
				ph.exit();
				if(res==null || res==''){
					if(callback) callback();
					return false;
				}
				console.log('got: ' + res);
				var frURL = res;
				Fiber(function(){
			    Meteor.http.get(frURL, function (error, result) {
			      if(error || result.statusCode != 200) {
			        console.log('http1 get FAILED!');
			      }
			      else {
			      	var htmlText = result.content;
			        var validationToken = htmlText.match(/window\.validationToken\s*=\s*\".*\"/g)[0].replace(/\"/g,"").split('=')[1].trim();
							var socketServerURL = htmlText.match(/window\.socketServerURL\s*=\s*\".*\"/g)[0].replace(/\"/g,"").split('=')[1].trim();
							var matchId = htmlText.match(/window\.matchId\s*=\s*\".*\"/g)[0].replace(/\"/g,"").split('=')[1].trim();
							var params = "&topreferer=wab-visualisation.performgroup.com&referer=https%3A%2F%2Fwab-visualisation.performgroup.com%2Fcsb%2Findex.html&width=334&height=190&cssdiff=https%3A%2F%2Fassets.cdnbf.net%2Fstatic%2Fdatavis%2Fbf-css%2Fbetfair1.css&flash=y&streamonly=true&partnerId=7&statsswitch=false&lang=en&defaultview=viz&version=1.19&multimatch=false&EIO=3&transport=websocket";
							var wsUrl = socketServerURL + '/socket.io/?token=' + validationToken + params;
							console.log('wsUrl = ' + wsUrl);
							// Save wsUrl of this event.
							Fiber(function(){
			          Events.upsert({id: eventId}, {$set: {wsUrl: wsUrl, matchId: matchId}});
			          if(callback) callback(wsUrl);
			        }).run();
			      }
			    });
		    }).run();
			},[eventId],true);
	  });
	});
};

