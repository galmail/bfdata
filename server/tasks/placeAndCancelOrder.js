// placeAndCancelOrder.js

// betParams = {
// 	betRef: "abc123",
// 	marketId: "1.122073504",
// 	selectionId: "1222344",
// 	side: "BACK",
// 	size: "2",
// 	price: "1.8"
// };


/***********

To Get Profit: 1/x + 1/y < 1

To dutch: (100-((100*x)/(x+y)))*(M/100) where M is the money stake in total

x and y are expressed in Betfair DECIMALS.

Greening Up Technique:

If you back first, for example 10 pounds then:

(x/y)*m where m=10 and x is the back odd, y is the lay odd.

If you lay first, for example 10 pounds then:

(y/x)*m where m=10 and x is the back odd, y is the lay odd.

===================================


Functions to build:

Given a Specific Event and Market, also specific selection (under/over).


1. Whether placing a back or lay order, look for the best odds.
Eg. compare back underX vs. lay overX see which one has better odds or more liquidity.




1. Get bet delay from API, eg. 6sec.
2. Place every 0.5sec a BACK Order and LAY Order.
3. Cancel automatically 1sec before the bet delay.












***********/






runPlaceAndCancelOrder = function(bot,betParams){
  console.log("Inside Place Order...");
  console.log("betParams:" , betParams);

  bot.placeOrders(
    {
    	marketId: betParams.marketId,
    	customerRef: ""+Math.random(),
    	instructions: [{
	    	handicap: "0",
	    	orderType: "LIMIT",
	    	selectionId: betParams.selectionId,
	    	side: betParams.side,
	    	limitOrder: {
	    		size: betParams.size,
	    		price: betParams.price,
	    		persistenceType: "PERSIST"
	    	}
    	}]
    },
    function(err,res){
      if(err){
        console.log("ERROR: ",err);
        return false;
      }
      var placeExecutionReport = res.response.result;
      if(placeExecutionReport.status == "FAILURE"){
      	console.log("place order failed: ", placeExecutionReport.errorCode);
      	// failed

    		// customerRef: "abc123",
				// errorCode: "DUPLICATE_TRANSACTION", // errorCode: "INSUFFICIENT_FUNDS"
				// instructionReports: [{
				// 	status: "",
				// 	betId: "",
				// 	placedDate: "",
				// 	averagePriceMatched: "",
				// 	sizeMatched: ""
				// }],
				// marketId: "1.120380522",
				// status: "FAILURE"
      }
      else if (placeExecutionReport.status == "SUCCESS"){
      	console.log("the order was placed!", placeExecutionReport.instructionReports[0]);

      	bot.listCurrentOrders(
      		{
      			dateRange: {},
      			marketIds: [betParams.marketId]
      		},
      		function(err,res){
			      if(err){
			        console.log("ERROR: ",err);
			        return false;
			      }
			      var orderExecutionReport = res.response.result;
			      var numOrders = orderExecutionReport.currentOrders.length;
			      if(numOrders==0){
			      	console.log("No orders available for this market");
			      	return false;
			      }
			      var firstOrder = orderExecutionReport.currentOrders[0];
			      console.log("firstOrder",firstOrder);

			      // first Order params should look like these...

			      // averagePriceMatched: 0
						// betId: "58868025167"
						// bspLiability: 0
						// handicap: 0
						// marketId: "1.122078866"
						// orderType: "LIMIT"
						// persistenceType: "PERSIST"
						// placedDate: "2015-12-01T14:22:30.000Z"
						// priceSize: {price: 2.5, size: 2}
						// price: 2.5
						// size: 2
						// regulatorCode: "GIBRALTAR REGULATOR"
						// selectionId: 1222344
						// side: "BACK"
						// sizeCancelled: 0
						// sizeLapsed: 0
						// sizeMatched: 0
						// sizeRemaining: 2
						// sizeVoided: 0
						// status: "EXECUTABLE" // it is EXECUTION_COMPLETE when matched...

			      
			      
			    }
      	);








				// success, now cancel the order...
      	var betId = placeExecutionReport.instructionReports[0].betId;
      	console.log("canceling the order with betId: ",betId);

      	bot.cancelOrders(
      		{
      			marketId: betParams.marketId,
      			customerRef: ""+Math.random(),
      			instructions: [{
				    	betId: betId,
				    	//sizeReduction can be use in case of partial cancel.
				    }]
			  	},
			  	function(err,res){
			      if(err){
			        console.log("ERROR: ",err);
			        return false;
			      }
			      var cancelExecutionReport = res.response.result;
			      if(cancelExecutionReport.status == "SUCCESS"){
			      	// ok, the order was canceled!
			      	console.log("the order was canceled!");
			      }
			      else if (cancelExecutionReport.status == "FAILURE"){
			      	console.log("cancel order failed: ", cancelExecutionReport.errorCode);
			      }
			    }
      	);
      }
    }
  );
};
