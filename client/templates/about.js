// about.js

Template.about.helpers({});

Template.about.events({

  "click #startWsCollection": function(){
    var eventId = $('#eventInput').val();
    console.log("loading ws for eventId=" + eventId);
    Meteor.call("startWsCollection", eventId, function(error, res) {
      if(error) console.log("error",error);
      else {
        console.log("res",res);
      }
    });
    return false;
  },

  "click #socketConnect": function(){
    var eventId = $('#eventInput').val();
    Meteor.call("readFromSocket", eventId, function(error, res) {
      if(error) console.log("error",error);
      else {
        console.log("res",res);
        // websocket = new WebSocket(res.wsUrl);
        // websocket.onopen = function(evt) {
        //   console.log("onopen",evt);
        //   //websocket.send('subscribe', {"Topic": res.matchId,"LiveUpdates":"true","OddsUpdates":"true","VideoUpdates":"true","ConditionsUpdates":"true"});
        // };
        // websocket.onclose = function(evt) {
        //   console.log("onclose",evt);
        // };
        // websocket.onmessage = function(evt) {
        //   console.log("onmessage",evt);
        // };
        // websocket.onerror = function(evt) {
        //   console.log("onerror",evt);
        // };
      }
    });
    return false;
  }
});