// backLayQueue.js

BackLayQueue = {

  amount: 2,                 // use 2 pounds as fixed amount for each order
  placeOrderFrecuency: 2000, // place new order every 2000ms
  ordersBatchSize: 6,        // place 6 orders at the same time
  pendingOrders: [],         // where all the pending orders will be stored
  placedOrders: [],          // where all the placed orders will be stored
  priceDecay: 0.01,          // assuming the price will drop 0.01 in the next 5sec

  start: function(marketId,tradeId){
    if(Meteor.settings.bf.virtualTrading) return;
    var backLay = function(marketId){
      //stop the queue if market is not hot
      var market = Markets.findOne({_id: marketId});
      if(market==null || !market.isHot) return;

      if(new Date() - market.backLayStartTime >= (1000*market.betDelay - BackLayQueue.placeOrderFrecuency)){
        BackLayQueue.cancelFirstBatchPendingOrders(marketId);
      }

      var price = parseFloat(market.lastPriceTraded).toFixed(2) - BackLayQueue.priceDecay;
      var overPrice = parseFloat(price + 0.01).toFixed(2);
      var underPrice = parseFloat(price - 0.01).toFixed(2);
      
      if(BackLayQueue.ordersBatchSize != 6) return;
      var batchId = marketId + '+' + new Date().getTime();
      // for now, only back and lay on the under market.
      var selectionId = market.runners[0].selectionId;
      
      BackLayQueue.placeOrder(batchId,marketId,"back",overPrice,selectionId);
      BackLayQueue.placeOrder(batchId,marketId,"back",price,selectionId);
      BackLayQueue.placeOrder(batchId,marketId,"lay",price,selectionId);
      BackLayQueue.placeOrder(batchId,marketId,"lay",underPrice,selectionId);

      // This two are only used to exit the trade, in case things go wrong.
      BackLayQueue.placeOrder(batchId,marketId,"back",underPrice,selectionId);
      BackLayQueue.placeOrder(batchId,marketId,"lay",overPrice,selectionId);
      
      Meteor.setTimeout(function(){
        backLay(marketId);
      },BackLayQueue.placeOrderFrecuency);
    };

    var market = Markets.findOne({_id: marketId});
    if(market==null || market.backLayStarted) return;

    console.log("Start Back/Lay Queue on Market: " + market.name);
    Markets.update({_id: marketId},{ $set: { isHot: true, backLayStarted: true, backLayStartTime: new Date() }});
    Trades.update({_id: tradeId},{ $set: { status: "BackLayQueue Starting", result: "neutral", tradingEndTime: new Date() } });
    backLay(marketId);
  },

  stop: function(marketId){
    if(Meteor.settings.bf.virtualTrading) return;
    var market = Markets.findOne({_id: marketId});
    if(market.tradingInProgress) return; //never stop the queue when trade is in progress.
    if(market!=null && (market.backLayStarted || market.isHot)){
      console.log("Stop Back/Lay Queue on Market: " + market.name);
      Markets.update({_id: marketId},{ $set: { isHot: false, backLayStarted: false }});
    }
    BackLayQueue.cancelAllPendingOrders(marketId);
  },

  openTrade: function(marketId,tradeId){
    if(Meteor.settings.bf.virtualTrading) return;
    var trade = Trades.findOne({_id: tradeId});
    if(trade==null || BackLayQueue.pendingOrders.length==0) return;
    var batchId = null;
    var lastOrders = [];
    var backOrder = null;
    var layOrder = null;
    for(var i=BackLayQueue.pendingOrders.length-1;i>=0;i--){
      if(batchId==null){
        if(BackLayQueue.pendingOrders[i].split('+')[0]==marketId){
          batchId = BackLayQueue.pendingOrders[i].split('-')[0];
          var orderId = BackLayQueue.pendingOrders[i].split('::')[0];
          var orderInfo = orderId.split('-')[1];
          var action = orderInfo[0];
          var price = parseFloat(orderInfo.replace(orderInfo[0],""));
          if(action=="b" && price==trade.entryPrice){
            backOrder = BackLayQueue.pendingOrders[i];
          }
          else if(action=="l" && price==trade.exitPrice){
            layOrder = BackLayQueue.pendingOrders[i];
          }
          lastOrders.push(BackLayQueue.pendingOrders[i]);
          if((backOrder!=null && layOrder!=null) || lastOrders.length==BackLayQueue.ordersBatchSize){ break; }
        }
      }
      else {
        if(BackLayQueue.pendingOrders[i].split('-')[0]==batchId){
          var orderId = BackLayQueue.pendingOrders[i].split('::')[0];
          var orderInfo = orderId.split('-')[1];
          var action = orderInfo[0];
          var price = parseFloat(orderInfo.replace(orderInfo[0],""));
          if(action=="b" && price==trade.entryPrice){
            backOrder = BackLayQueue.pendingOrders[i];
          }
          else if(action=="l" && price==trade.exitPrice){
            layOrder = BackLayQueue.pendingOrders[i];
          }
          lastOrders.push(BackLayQueue.pendingOrders[i]);
          if((backOrder!=null && layOrder!=null) || lastOrders.length==BackLayQueue.ordersBatchSize){ break; }
        }
      }
    }
    var lastOrdersTime = parseInt(batchId.split('+')[1]);
    var now = new Date().getTime();
    var nextOrderReaction = now - lastOrdersTime;
    if(nextOrderReaction >= 1000){
      console.log("Aborting OpenTrade @"+marketId+", lastOrdersTime is: " + nextOrderReaction + "ms");
      Trades.update({_id: tradeId},{$set: { status: "NextOrder Delayed", result: "neutral", tradingEndTime: new Date() }});
      Markets.update({_id: marketId},{ $set: { tradingInProgress: false, tradingEndTime: new Date() } });
      return;
    }
    else if(backOrder==null || layOrder==null){
      console.log("Aborting OpenTrade @"+marketId+", backOrder/layOrder dont have entry/exit price.");
      console.log("entryPrice: " + trade.entryPrice + " exitPrice: " + trade.exitPrice);
      console.log("batchOrders: " + lastOrders.join("\n"));
      Trades.update({_id: tradeId},{$set: { status: "NextOrder Missed Entry/Exit Price", result: "neutral", tradingEndTime: new Date() }});
      Markets.update({_id: marketId},{ $set: { tradingInProgress: false, tradingEndTime: new Date() } });
      return;
    }
    else {
      console.log("Placing backOrder/layOrder @"+marketId+", for entryPrice: " + trade.entryPrice + " and exitPrice: " + trade.exitPrice);
      //remove these orders from pendingOrders and insert them in the placedOrders array.
      BackLayQueue.pendingOrders.splice(BackLayQueue.pendingOrders.indexOf(backOrder), 1);
      BackLayQueue.pendingOrders.splice(BackLayQueue.pendingOrders.indexOf(layOrder), 1);
      BackLayQueue.placedOrders.splice(0, 0, backOrder);
      BackLayQueue.placedOrders.splice(0, 0, layOrder);
      Trades.update({_id: tradeId},{$set: { status: "Trade Started", result: null, tradingStartTime: new Date() }});
      Markets.update({_id: marketId},{ $set: { tradeId: tradeId, tradingInProgress: true, tradingStartTime: new Date() } });
    }
  },

  placeOrder: function(batchId,marketId,action,price,selectionId){
    // place order and insert into pending orders if order placed OK
    var orderId = batchId + '-' + action[0] + price;
    TestBot.placeOrders(
      {
        marketId: marketId,
        customerRef: orderId,
        instructions: [{
          handicap: "0",
          orderType: "LIMIT",
          selectionId: selectionId,
          side: action.toUpperCase(),
          limitOrder: {
            size: BackLayQueue.amount,
            price: price,
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
        if(placeExecutionReport.status != "SUCCESS"){
          console.log("Order Not Placed: ", placeExecutionReport.errorCode);
          //TODO: order was not placed OK, DO SOMETHING!!
          return;
        }
        // order placed ok, save betId.
        var betId = placeExecutionReport.instructionReports[0].betId;
        orderId = orderId + "::" + betId;
        // inserting order into pending orders...
        BackLayQueue.pendingOrders.splice(0, 0, orderId);
      }
    );    
  },

  cancelOrder: function(marketId,orderId){
    // removing the order from pending orders
    BackLayQueue.pendingOrders.splice(BackLayQueue.pendingOrders.indexOf(orderId), 1);
    
    // cancel the order
    TestBot.cancelOrders(
      {
        marketId: marketId,
        customerRef: orderId.split('::')[0],
        instructions: [{
          betId: orderId.split('::')[1]
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
          //TODO: order was not canceled, DO SOMETHING!!
        }
      }
    );
  },

  cancelFirstBatchPendingOrders: function(marketId){
    if(BackLayQueue.pendingOrders.length==0) return;
    var batchId = null;
    for(var i=BackLayQueue.pendingOrders.length-1;i>=0;i--){
      if(batchId==null){
        if(BackLayQueue.pendingOrders[i].split('+')[0]==marketId){
          batchId = BackLayQueue.pendingOrders[i].split('-')[0];
          BackLayQueue.cancelOrder(marketId,BackLayQueue.pendingOrders[i]);
        }
      }
      else {
        if(BackLayQueue.pendingOrders[i].split('-')[0]==batchId){
          BackLayQueue.cancelOrder(marketId,BackLayQueue.pendingOrders[i]);
        }
      }
    }
  },

  cancelAllPendingOrders: function(marketId){
    if(BackLayQueue.pendingOrders.length==0) return;
    // cancel the order
    TestBot.cancelOrders(
      {
        marketId: marketId,
        instructions: [{
          //betId: betId,
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
          console.log("All orders were canceled for Market: " + marketId);
          _.each(BackLayQueue.pendingOrders,function(orderId,index){
            if(orderId.split('+')[0]==marketId){
              BackLayQueue.pendingOrders.splice(index, 1); // remove it
            }
          });
        }
        else if (cancelExecutionReport.status == "FAILURE"){
          console.log("Cancel orders failed for marketId="+ marketId +": ", cancelExecutionReport.errorCode);
          //TODO: orders were not canceled, DO SOMETHING!!
        }
      }
    );
  },

  cancelAllOrders: function(){
    TestBot.cancelOrders(
      {},
      function(err,res){
        if(err){
          console.log("ERROR: ",err);
          return false;
        }
        else {
          console.log("All Pending Orders were Canceled!!");
          BackLayQueue.pendingOrders = [];
        }
      }
    );
  },













  // check if both back/lay orders of this market were matched.
  // if none were matched, cancel the trade.
  // if only one were matched, try to abort the trade with a small loss.
  abortTrade: function(marketId,reason){
    if(Meteor.settings.bf.virtualTrading) return;
    console.log("TODO: Abort Trade on Market: " + marketId);
    //Trades.update({_id: market.tradeId},{$set: { marketSuspended: true, result: "failure", tradingEndTime: new Date() }});
    //Markets.update({_id: market._id},{ $set: { tradingInProgress: false } });
    return;
  },

  // check if both back/lay orders of this market were matched,
  // if none were matched, cancel the trade.
  // if only one were matched, try to break-even.
  breakEvenTrade: function(marketId,tradeId){
    BackLayQueue.cancelTrade(marketId,tradeId,function(numOrdersMatched,orders){
      if(numOrdersMatched==1){
        console.log("Only one order was matched, trying to breakeven..");
        


        







      }
    });
  },

  // check if the placed orders of this market were matched, if none were match, cancel them.
  cancelTrade: function(marketId,tradeId,callback){
    BackLayQueue.checkTrade(marketId,tradeId,function(numOrdersMatched,orders){
      if(numOrdersMatched==0){
        console.log("No orders were matched, canceling both orders now...");
        BackLayQueue.cancelOrder(marketId,orders[0]);
        BackLayQueue.cancelOrder(marketId,orders[1]);
        // update trade
        Trades.update({_id: tradeId},{ $set: { tradingEndTime: new Date(), result: "neutral", status: "No Orders Matched" } });
        Markets.update({_id: marketId},{ $set: { tradingInProgress: false } });
        if(callback) callback(numOrdersMatched,orders);
      }
    });
  },

  // check if the placed orders of this market were matched.
  checkTrade: function(marketId,tradeId,callback){
    console.log("Checking Trade on Market: " + marketId);
    var orders = [];
    var betIds = [];
    _.each(BackLayQueue.placedOrders,function(orderId){
      if(orderId.split('+')[0]==marketId){
        orders.push(orderId);
        betIds.push(orderId.split('::')[1]);
      }
    });

    TestBot.listCurrentOrders(
      {
        betIds: [betIds],
        dateRange: {}
      },
      function(err,res){
        if(err){
          console.log("ERROR: ",err);
          return false;
        }
        var orderExecutionReport = res.response.result;
        var numOrders = orderExecutionReport.currentOrders.length;
        if(numOrders==0){
          console.log("No orders available on market: " + marketId);
          return false;
        }

        var numOrdersMatched = 0;
        _.each(orderExecutionReport.currentOrders,function(order){
          if(order.status=="EXECUTION_COMPLETE"){
            numOrdersMatched++;
            if(order.side=="BACK"){
              Trades.update({_id: tradeId},{ $set: { backOrder: order } });
            }
            else {
              Trades.update({_id: tradeId},{ $set: { layOrder: order } });
            }
          }
        });

        if(numOrdersMatched==2){
          // both orders were matched, update trade and market.
          console.log("Trade Success!!!");
          Trades.update({_id: tradeId},{ $set: { tradingEndTime: new Date(), result: "success", status: "success" } });
          Markets.update({_id: marketId},{ $set: { tradingInProgress: false } });
        }
        if(callback) callback(numOrdersMatched,orders);
      }
    );
  },

  // adjust profit if partially matched, squeezing profit to 1%
  adjustTrade: function(marketId){
    //TODO: implement this function in the future
  }


};
