// orders.js

//{ orderId: orderId, placedTime: new Date(), side: action, price: price, marketId: marketId, cancelledTime: new Date(), createdAt: new Date() }

Orders = new Mongo.Collection("orders",
{
  transform:function(entry)
  {
  	entry.duration = function(){
  		return parseFloat((this.cancelledTime - this.placedTime)/1000).toFixed(2);
  	};

  	entry.responseTime = function(){
  		return parseFloat((this.placedTime - this.createdAt)/1000).toFixed(2);
  	};

    return entry;
  }
});
