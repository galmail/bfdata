Template.logs.helpers({
  logs: function () {
    return Logs.find({},{limit:1000,sort:{marketId:1,lastMatchTime:-1}});
  }
});