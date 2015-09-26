// placeOrderBot.js
//
// This bot automatically place and cancel orders for a specific market to skip the "bet delay".
// On a "back signal", it will do the following actions:
// 1. Stop placing new "back" orders.
// 2. Stop canceling the "back" orders already placed.
// 3. Apply Auto-dutching: Stop canceling the "lay" orders for every matched "back" order.
// 4. If after 2sec there is still a matched order that wasn't dutched, dutch all immediately.
// 5. Once finish, keep running on "standby-mode" (by placing and canceling orders continously)


// All orders should be a fixed small amount to make sure these are always matched.


// betParams = {
// 	betRef: "abc123",
// 	marketId: "1.876543",
// 	selectionId: "45678765",
// 	side: "BACK", // back or lay
// 	size: "2", // betting 2 pounds
// 	price: "1.26" // price (odd) of the bet
// };

placeOrderBot = function(bot,betParams){
  console.log("Inside Place Order...");
  bot.placeOrders(
    {
    	marketId: betParams.marketId,
    	customerRef: betParams.betRef,
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
      	// success, now cancel the order...
      	var betId = placeExecutionReport.instructionReports[0].betId;

      	bot.cancelOrders(
      		{
      			marketId: betParams.marketId,
      			customerRef: betParams.betRef,
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
