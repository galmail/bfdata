// markets.js

Markets = new Mongo.Collection("markets",
{
  transform:function(entry)
  {

    return entry;
  }
});
