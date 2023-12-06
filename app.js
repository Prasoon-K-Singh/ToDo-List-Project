const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-prasoon:Test123@cluster0.zm1kpu3.mongodb.net/todolistDB");

const itemSchema = {
    name: String
};

const Item = new mongoose.model("item", itemSchema);

const item1 = new Item({
    name: "Welcome to your to do list!"
});

const item2 = new Item({
    name: "Hit the + button to add a new item."
});

const item3 = new Item({
    name: "<-- Hit this to delete an item."
});

const defaultItem = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemSchema]
};

const List = new mongoose.model("list", listSchema);


app.get("/", function (req, res) {

    Item.find({})
        .then((foundItems) => {
            if (foundItems.length === 0) {
                Item.insertMany(defaultItem)
                    .then(() => console.log("Successful..."))
                    .catch(() => console.log(err));
                res.redirect("/");
            } else {
                res.render("list", { listTitle: "Today", newListItems: foundItems })
            }
        });

});

app.post("/", function (req, res) {

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName })
            .then((foundList) => {
                foundList.items.push(item);
                foundList.save();
                res.redirect("/" + listName);
            })
            .catch(() => console.log(err));
    }

});

app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndDelete(checkedItemId)
            .then(() => console.log("Successfully deleted the item."),
                res.redirect("/"))
            .catch(() => console.log(err));
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } })
            .then(() => res.redirect("/" + listName))
            .catch(() => console.log(err));

    }

});

app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName })
        .then((foundList, err) => {
            if (!err) {
                if (!foundList) {
                    const list = new List({
                        name: customListName,
                        items: defaultItem
                    });

                    list.save();
                    res.redirect("/" + customListName);
                } else {
                    res.render("list", { listTitle: foundList.name, newListItems: foundList.items })
                }
            }
        })
        .catch(() => console.log(err));

});

app.get("/about", function (req, res) {
    res.render("about");
});

app.listen(4000, function () {
    console.log("Server started on port 4000");
});