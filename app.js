const express = require("express");
const bodyParser = require("body-parser");
const path = require('path');
const mongoose = require("mongoose");
const config = require('./config');
const { Post } = require('./models');
const routes = require('./routes');
// const session = require('express-session');
// const MongoStore = require('connect-mongo')(session);

// database
mongoose.Promise = global.Promise;
mongoose.set("debug", true);

mongoose.connection
  .on("error", error => console.log(error))
  .on("close", () => console.log("Database connection closed"))
  .once("open", () => {
    const info = mongoose.connections[0];
    console.log(`Connected to ${info.host}:${info.port}/${info.name}`);
  });

mongoose.connect(config.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

// express
const app = express();

// sets and uses
app.set("view engine", "ejs"); // работает с папкой views
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // обработка данных ajax-запросов в /routes
app.use(express.static(path.join(__dirname, 'public'))); // конфиг доступа к файлам разработки
app.use(
  '/js',
  express.static(path.join(__dirname, 'node_modules', 'jquery', 'dist'))
); // jquery config + footer's jquery file connect
app.use('/ajax', routes.auth);


// routes
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
  const { title, body } = req.body;
  // запись в бд
  Post.create({
    title,
    body
  }).then(post => console.log(post.id));
  res.redirect("/about");
});


app.listen(config.PORT, () =>
  console.log(`Server is running on port ${config.PORT}`)
);
