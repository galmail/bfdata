// virtualSportsAgent.js

//mongo_apikey = "wGtHOle0k7O745R7Z_7Emzr0bNGcDIb2";
//myurl = "https://www.betfair.com/sport/football/event?eventId=27450734";

virtualSportsAgent = {};

virtualSportsAgent.jqScript = "http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js";

virtualSportsAgent.parsePage = function(page,_url,fnSelector,callback,args,includeJQuery){
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
      		page.includeJs(virtualSportsAgent.jqScript,function(){
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

virtualSportsAgent.login = function(){
	console.log('Inside login function !!!!!!!!!');
	virtualSportsAgent.url = "https://www.betfair.com/sport/virtuals/football";

	virtualSportsAgent.testindex = 0;
	virtualSportsAgent.loadInProgress = false;




	Phantom.create("--web-security=no", "--ignore-ssl-errors=yes",{},function (ph) {
	  ph.createPage(function(page){
	  	page.onConsoleMessage = function(msg) {
			  console.log(msg);
			};

			page.onLoadStarted = function() {
			  virtualSportsAgent.loadInProgress = true;
			  console.log("load started");
			};

			page.onLoadFinished = function() {
			  virtualSportsAgent.loadInProgress = false;
			  console.log("load finished");
			};

			virtualSportsAgent.steps = [
			  function() {
			    //Load Login Page
			    console.log("opening page: " + virtualSportsAgent.url);
			    page.open(virtualSportsAgent.url);
			    //virtualSportsAgent.parsePage(page,virtualSportsAgent.url);
			  },
			  function() {
			    //Enter Credentials

			    page.evaluate(function() {
			      document.getElementById("ssc-liu").value="myusername";
			      document.getElementById("ssc-lipw").value="mypassword";
			    });
			  },
			  function() {
			    //Login
			    page.evaluate(function() {
			      var theForm = document.getElementsByClassName("ssc-lif")[0];
			      theForm.submit();
			    });
			  }, 
			  function() {
      		page.evaluate(function() {
      			var result = "";
      			// checking if we are logged.
		    		if(document.getElementsByClassName("ssc-un").length==0) return "notlogged";
		    		// if there is a modal (popup) then close it.
		    		if(document.getElementsByClassName("ssc-modal-close").length>0)
		    			document.getElementsByClassName("ssc-modal-close")[0].click();

		    		result += document.cookie;

		    		// place a bet

		    		if(document.querySelector(".content:nth-child(3) .type-over_under_25 .market-selections.market-match-odds a")==null) return "a1";
		    		else document.querySelector(".content:nth-child(3) .type-over_under_25 .market-selections.market-match-odds a").click();
		    		if(document.querySelector(".bets-container input.stake")==null) return "b1";
		    		else document.querySelector(".bets-container input.stake").value="0.1";

		    		result += "*****";

		    		var inputs = document.querySelectorAll("#betslip-virtual-form-edit input");
		    		for(var i=0;i<inputs.length;i++){
		    			if(inputs[i].name.indexOf("bet-")==0 && inputs[i].value!=""){
		    				if(i>0) result += "&";
		    				result += inputs[i].name + "=" + inputs[i].value;
		    			}
		    		}
		    		
		    		return result;

		    		// if(document.querySelector(".betslip-body button.place-bets-button")==null) return "c1";
		    		// var submitBtn = document.querySelector(".betslip-body button.place-bets-button");
		    		// if(submitBtn.className.indexOf("ui-disabled")>0) submitBtn.classList.remove("ui-disabled");
		    		// submitBtn.click();




			    	//return "logged";
			    },function(result){

			    	console.log(result);
			    	if(result.indexOf("*****")<0) return;
			    	//result = result.split("&confirm-bets")[0];

			    	var cookie = result.split("*****")[0];
			    	var formData = result.split("*****")[1];

			    	var xsrftokenStr = cookie.match(/xsrftoken=[a-z0-9-]+/g)[0];
			    	var url = "https://www.betfair.com/sport/pref/?"+xsrftokenStr;
			    	
			    	Fiber(function(){
			    	try {
				    	var resCall1 = HTTP.post(url,{
				    		data: {"betslipSelectedTab":"VIRTUAL","isBetslipOpen":true},
				    		headers: {
				    			"Content-Type": "application/json",
				    			"Accept": "application/json",
				    			"Cookie": cookie
				    		}
				    	});
				    	console.log("resCall1.statusCode: ", resCall1.statusCode);
				    	console.log("resCall1.content: ", resCall1.content);

				    	if(resCall1.statusCode != 200) return;

				    	var xsrftoken = xsrftokenStr.split("xsrftoken=")[1];
				    	var placeBetUrl = "https://www.betfair.com/sport/place-bet?redirectPath=%2Fvirtuals%2Ffootball&action=place&modules=betslip&bsContext=VIRTUAL&xsrftoken="+xsrftoken+"&lastId=1067";
				    	var formParams = formData.split("&");
				    	var params = { "timestamp": new Date().getTime().toString() };
				    	for(var i=0;i<formParams.length;i++){
				    		var p = formParams[i].split("=");
				    		params[p[0]]=p[1];
				    	}
				    	console.log(params);
				    	return; //////////////////////////////////////// removing this line will place the bet
				    	try {
					    	var resCall2 = HTTP.post(placeBetUrl,{
					    		headers: {
					    			"Accept": "*/*",
					    			"Content-Type": "application/x-www-form-urlencoded",
					    			"BF-FP":"7233",
					    			"Cookie": cookie
					    		},
					    		params: params
					    		//params: {"redirectPath": "/virtuals/football","action": "confirm","modules":"betslip","bsContext":"VIRTUAL","xsrftoken":xsrftoken,"lastId":"1067"},
					    		//content: formData
					    	});

					    	console.log("resCall2.statusCode: ", resCall2.statusCode);
				    		console.log("resCall2.content: ", resCall2.content);

					    } catch(e) {
					    	console.log("error",e);
					    }

				    } catch (e) {
					    // Got a network error, time-out or HTTP error in the 400 or 500 range.
					    console.log("error",e);
					  }
					  }).run();





			    	

			    	//Fiber(function(){
				    //}).run();
			   		






			   		//  	var server = "https://www.betfair.com/sport/place-bet?redirectPath=/virtuals/football&action=confirm&modules=betslip&bsContext=VIRTUAL&"+token;
			   		//  	page.open(server, 'post', data, function (status) {
						//     if (status !== 'success') {
						//         console.log('Unable to post!');
						//     } else {
						//         console.log(page.content);
						//     }
						//     phantom.exit();
						// });



			    	// Fiber(function(){
			     //  	TraceLogs.insert({date: new Date(), doc: res});
			     //  }).run();
			    });
			  },
			  function() {
      		page.evaluate(function() {

      		});
      	}
			];


			virtualSportsAgent.interval = setInterval(function() {
			  if (!virtualSportsAgent.loadInProgress && typeof virtualSportsAgent.steps[virtualSportsAgent.testindex] == "function") {
			    console.log("step " + (virtualSportsAgent.testindex + 1));
			    virtualSportsAgent.steps[virtualSportsAgent.testindex]();
			    virtualSportsAgent.testindex++;
			  }
			  if (typeof virtualSportsAgent.steps[virtualSportsAgent.testindex] != "function") {
			    clearInterval(virtualSportsAgent.interval);
			    console.log("test complete!");
			    ph.exit();
			  }
			}, 2000);











	  });
	});

			











};












