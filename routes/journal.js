const express = require("express");
const router = express.Router();
const moment = require("moment");
const config = require("../config");
const { Post, User, Comment } = require("../models");
const PageError = require("../error.js");

moment.locale("ru");

async function posts(req, res, user) {
  const perPage = Number(config.PER_PAGE);
  const page = req.params.page || 1;
  const findUser = user && user.id ? { author: user.id, status: 'published' } : { status: 'published' };
  const path = user && user.id ? `/users/${req.params.login}` : "";

  try {
    const posts = await Post.find(findUser)
      .skip(perPage * page - perPage)
      .limit(perPage)
      .populate("author") // по id находим это поле в др.таблице
      .sort({ createdAt: -1 }); // сортировка записей в обратном порядке

    const count = await Post.count(findUser);

    res.render("index", {
      posts,
      path,
      currentPage: page,
      pages: Math.ceil(count / perPage),
      user: {
        // передаем данные из сессии
        id: req.session.userId,
        login: req.session.userLogin
      }
    });
  } catch (err) {
    throw new Error("Server Error");
  }
}

router.get("/", (req, res) => posts(req, res));
router.get("/?page=:page", (req, res) => posts(req, res));
router.get("/posts/:post", async (req, res, next) => {
  const url = req.params.post;

  if (!url) {
    next(new PageError("Page Not Found"));
  } else {
    try {
      const post = await Post.findOne({
        url,
        status: 'published'
      }).populate("author");

      if (post) {
        const comments = await Comment.find({
          post: post.id,
          parent: null
          // parent: { $exists: false }
        });
        res.render("post", {
          post,
          comments,
          moment,
          user: {
            user: req.session.userId,
            login: req.session.userLogin
          }
        });
      } else {
        next(new PageError("Page Not Found"));
      }
    } catch (err) {
      throw new Error("Server Error");
    }
  }
});

router.get("/users/:login/p?a?g?e?=?:page*?", async (req, res) => {
  const login = req.params.login;

  try {
    const user = await User.findOne({ login });
    posts(req, res, user);
  } catch (err) {
    throw new Error("Server Error");
  }
});

module.exports = router;
