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
// 	marketId: "1.122078866",
// 	selectionId: "1222344",
// 	side: "BACK",
// 	size: "2",
// 	price: "2.5"
// };

placeOrderBot = function(bot,betParams){
  console.log("Inside Place Order...");
};

startPlaceOrderBot = function(bot,marketId){
	//console.log('*** StartPlaceOrderBot Starting ***');
	// if already started, just exit..
};

stopPlaceOrderBot = function(bot,marketId){
	//console.log('*** StopPlaceOrderBot Starting ***');
	// if not started, just exit..
};



