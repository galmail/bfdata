Template.bots.helpers({
  bots: function(){
    return Bots.find();
  },
  isActive: function(){
    return (this.status == 'active');
  }
});

Template.bots.events({
  "click .bot-action": function(event){
    var botid = event.target.dataset.botid;
    Meteor.call("runBot", botid, function(error, res) {
      if(error) console.log("error",error);
      else {
        console.log("res",res);
      }
    });
    return false;
  }
});