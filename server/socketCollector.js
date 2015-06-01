// socketCollector.js

mongo_apikey = "wGtHOle0k7O745R7Z_7Emzr0bNGcDIb2";

//mediator.subscribe("match",cb);
// mediator.subscribe("app",function(res){
// 	var action = {};
// 	if(res.eventItem){
// 		action = {
// 			date: new Date(),
// 			direction: res.eventItem.direction,
// 			eventCode: res.eventItem.eventCode
// 		};
// 	}
// 	console.log("action",action);
// });

myurl = "https://www.betfair.com/sport/football/event?eventId=27450734";
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


ignorePhantomErrors = function(msg, trace) {
  var msgStack = ['PHANTOM ERROR: ' + msg];
  if (trace && trace.length) {
    msgStack.push('TRACE:');
    trace.forEach(function(t) {
      msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function +')' : ''));
    });
  }
  console.error(msgStack.join('\n'));
  phantom.exit(1);
};

runWsCollector = function(eventId){
	var url = "https://www.betfair.com/sport/football/event?eventId=" + eventId;
  console.log('open: ' + url);
  //Phantom.onError = ignorePhantomErrors;
  Phantom.create("--web-security=no", "--ignore-ssl-errors=yes",{},function (ph) {
	  ph.createPage(function (page) {
			parsePage(page,url,function(){
				var frame1 = document.getElementsByClassName("player")[0];
				frame1 = (frame1.contentWindow || frame1.contentDocument);
				var frame2 = frame1.document.getElementById('playerFrame');
				frame2 = (frame2.contentWindow || frame2.contentDocument);
				var frame3 = frame2.document.getElementsByTagName('iframe')[0];

				$.ajax(frame3.src,{
					type: "GET",
					dataType: "html"
				}).success(function(htmlText){
					var validationToken = htmlText.match(/window\.validationToken\s*=\s*\".*\"/g)[0].replace(/\"/g,"").split('=')[1].trim();
					var socketServerURL = htmlText.match(/window\.socketServerURL\s*=\s*\".*\"/g)[0].replace(/\"/g,"").split('=')[1].trim();
					var matchId = htmlText.match(/window\.matchId\s*=\s*\".*\"/g)[0].replace(/\"/g,"").split('=')[1].trim();
					var urlToGetBitToken = socketServerURL + '/socket.io/1/?token=' + validationToken + '&topreferer=wab-visualisation.performgroup.com&multimatch=false&t=' + new Date().getTime();
					$.ajax(urlToGetBitToken,{
						type: "GET",
						dataType: "text"
					}).success(function(text){
						var bitToken = text.split(':')[0].trim();
						var murl = 'https://wab-visualisation.performgroup.com/animation/v2/index.html?token=' + validationToken + '&height=114&width=374&cssDiff=https://assets.cdnbf.net/static/datavis/bf-css/betfair1.css&version=1.15&lang=en';
						$.ajax(murl,{
							type: "GET",
							dataType: "html"
						}).success(function(htmlText){
							var newValidationToken = htmlText.match(/window\.validationToken\s*=\s*\'.*\'/g)[0].replace(/\'/g,"").split('=')[1].trim();
							var newSocketServerURL = htmlText.match(/window\.socketServerURL\s*=\s*\'.*\'/g)[0].replace(/\'/g,"").split('=')[1].trim();
							
							// building ws url
							var socketServer = newSocketServerURL.replace('https://','wss://');
							var baseUrl = socketServer +"/socket.io/1/websocket/";
							var params = "?token=" + newValidationToken + "&topreferer=wab-visualisation.performgroup.com&multimatch=false";
							var wsUrl = baseUrl + bitToken + params;

							// saving data...
							$.ajax({
								url: "https://api.mongolab.com/api/1/databases/actions/collections/sockets?apiKey=wGtHOle0k7O745R7Z_7Emzr0bNGcDIb2",
							  data: JSON.stringify({
							  	"wsUrl": wsUrl,
							  	"wsUrlPresent": true,
							  	"matchId": matchId,
							  	"eventId": eventId,
							  	"newValidationToken": newValidationToken,
							  	"newSocketServerURL": newSocketServerURL,
							  	"myHtml": htmlText
							  }),
							  type: "POST",
							  contentType: "application/json"
							});

						});
					});
				});
				return frame3.src;
			},function(res){
				url = res;
				console.log('got: ' + url);
			},["arg1","arg2"],true);
	  });
	});
};


Meteor.methods({

	startWsCollection: function(eventId){
		runWsCollector(eventId);
		return { res: "success" };
	}

});

