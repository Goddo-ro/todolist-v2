//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({name: "Welcome to your dotolist!"});
const item2 = new Item({name: "Hit the + button to add a new item."});
const item3 = new Item({name: "<-- Hit this to delete an item."});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {
  Item.find(null, function(err, items) {
    if (items.length === 0) {
      Item.insertMany(defaultItems, function(err, res) {
        if (err) {
          console.log(err);
        } else {
          console.log(res);
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: items});
    }
  });
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;

  const newItem = new Item({name: itemName});
  newItem.save();

  res.redirect("/");
});

app.get("/:customListName", function(req,res){
  const customListName = req.params.customListName;

  List.find({name: customListName}, function(err, items) {
    if (!items.length) {
      const list = new List({
        name: customListName,
        items: defaultItems
      })
      list.save();

      res.redirect("/" + customListName);
    } else {
      res.render("list", {listTitle: customListName, newListItems: items[0].items});
    }
  })
});

app.get("/about", function(req, res){
  res.render("about");
});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;

  Item.findByIdAndRemove(checkedItemId, function(err) {
    if (err) {
      console.log(err);
    }
  })

  res.redirect("/");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
