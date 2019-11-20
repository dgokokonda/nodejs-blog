const express = require("express");
const bodyParser = require("body-parser");
const path = require('path');
const Post = require('./models/post');

const app = express();

app.set("view engine", "ejs"); // работает с папкой views
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // конфиг доступа к файлам разработки
app.use(
  '/js',
  express.static(path.join(__dirname, 'node_modules', 'jquery', 'dist'))
); // jquery config + footer's jquery file connect

app.get("/", (req, res) => {
  // получение данных коллекции из бд
  Post.find({}).then(posts => {
    res.render("index", { posts });
  });
});

app.get('/about', (req, res) => {
    // получение данных коллекции из бд
    Post.find({}).then(posts => {
      res.render("about", { posts });
    });
});

app.get("/form", (req, res) => res.render("form"));
app.post("/form", (req, res) => {
  const {title, body} = req.body;
  // запись в бд
  Post.create({
    title,
    body
  }).then(post => console.log(post.id));
  res.redirect("/about");
});

module.exports = app;
