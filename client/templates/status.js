Template.status.helpers({
  bots: function(){
    return Bots.find();
  }
});

// Template.status.rendered = function(){
//   if (!this.rendered){
//     // run my code
//     Meteor.call("loadBots", function(error, res) {
//       console.log("loading bots from server...");
//       if(error) console.log("error",error);
//       else {
//         Template.status.helpers({ bots: res.bots });
//       }
//     });
//     this.rendered = true;
//   }
// };


Template.status.events({
  "click .bot-action": function(event){
    var botIndex = event.target.dataset.botindex;
    Meteor.call("runBot", botIndex, function(error, res) {
      if(error) console.log("error",error);
      else {
        console.log("res",res);
      }
    });
    return false;
  }
});