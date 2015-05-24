//Template.status.helpers({});

Meteor.call("loadBots", function(error, res) {
  console.log("loading bots from server...");
  if(error) console.log("error",error);
  else Template.status.helpers({ bots: res.bots });
});

Template.status.events({
  "click .bot-action": function(event){
    var botIndex = event.target.dataset.botindex;
    Meteor.call("startBot", botIndex, function(error, res) {
      if(error) console.log("error",error);
      else {
        console.log("res",res);
      }
    });
    return false;
  }
});