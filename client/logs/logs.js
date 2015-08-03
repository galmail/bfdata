Template.logs.helpers({
  logs: function () {
    return Logs.find({},{reactive:false,limit:20,sort:{marketId:1,lastMatchTime:-1}});
  }
});