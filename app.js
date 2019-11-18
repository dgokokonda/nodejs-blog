const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.set("view engine", "ejs"); // работает с папкой views
app.use(bodyParser.urlencoded({ extended: true }));

const data = ["test", "hello", "123"];
app.get("/", (req, res) => res.render("index", { name: "Vasya", data }));
app.get("/form", (req, res) => res.render("form"));
app.post("/form", (req, res) => {
  data.push(req.body.text);
  res.redirect("/");
});

module.exports = app;
