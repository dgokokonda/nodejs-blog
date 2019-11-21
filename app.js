const express = require("express");
const bodyParser = require("body-parser");
const path = require('path');
const mongoose = require("mongoose");
const config = require('./config');
const { News, Post } = require('./models');
const routes = require('./routes');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

// database
mongoose.Promise = global.Promise;
mongoose.set("debug", true);

mongoose.connection
  .on("error", error => console.log(error))
  .on("close", () => console.log("Database connection closed"))
  .once("open", () => {
    const info = mongoose.connections[0];
    console.log(`Connected to ${info.host}:${info.port}/${info.name}`);
    // require('./mocks')(); // генератор постов
  });

mongoose.connect(config.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

// express
const app = express();

// sessions
app.use(
  session({
    secret: config.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
      mongooseConnection: mongoose.connection
    })
  })
);

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
app.use('/post', routes.post);


// routes
app.get("/", (req, res) => {
  Post.find({}).then(posts => {
    // передаем данные из сессии
    res.render("index", {
      posts,
      user: {
        user: req.session.userId,
        login: req.session.userLogin
      }
    });
  });
});

app.get('/about', (req, res) => {
  // получение данных коллекции из бд
  News.find({}).then(posts => {
    res.render("about", { posts });
  });
});

app.get("/form", (req, res) => res.render("form"));
app.post("/form", (req, res) => {
  const { title, body } = req.body;
  // запись в бд
  News.create({
    title,
    body
  }).then(post => console.log(post.id));
  res.redirect("/about");
});

// catch 404 and forward to error handler
app.use((req, res) => {
  const err = new Error('Page Not Found');
  err.status = 404 || 500;
  res.render('error', {
    message: err.message,
    error: !config.IS_PRODUCTION ? err : {}
  });
});

app.listen(config.PORT, () =>
  console.log(`Server is running on port ${config.PORT}`)
);
