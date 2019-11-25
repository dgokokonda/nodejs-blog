const express = require("express");
const router = express.Router();
const tr = require('transliter');
const { Post } = require("../models");

router.get("/add", async (req, res) => {
  const { userId, userLogin } = req.session;

  if (!userId && !userLogin) {
    res.redirect('/');
  } else {
    try {
      const postByParams = {
        author: userId,
        status: 'draft'
      };
      let post = await Post.findOne(postByParams);

      if (!post) {
        post = await Post.create(postByParams)
      }
      return res.redirect(`/post/edit/${post.id}`);
    }
    catch (err) {
      console.log(err);
    }
  }
  res.render("post/add.ejs", {
    user: {
      id: req.session.userId,
      login: req.session.userLogin
    }
  });
});

// publish or save to draft
router.post("/add", async (req, res) => {
  const { title, body, postId, isDraft } = req.body;
  const { userId } = req.session;
  const url = `${tr.slugify(title)}-${Date.now().toString(36)}`;

  if (!title || !body) {
    res.json({
      ok: false,
      error: "Все поля должны быть заполнены!",
      fields: ["post-title", "post-body"]
    });
  } else if (title.length < 3 || title.length > 50) {
    res.json({
      ok: false,
      error: "Длина заголовка должна быть от 3 до 50 символов!",
      fields: ["post-title"]
    });
  } else if (body.length < 3 || body.length > 500) {
    res.json({
      ok: false,
      error: "Длина записи должна быть от 3 до 500 символов!",
      fields: ["post-body"]
    });
  } else if (!postId) {
    res.json({
      ok: false
    });
  } else {
    try {
      // редактируемый пост можно сохранить в черновик или опубликовать
      const post = await Post.findOneAndUpdate(
        { // ищем
          _id: postId,
          author: userId
        },
        { // вносим изм-я
          title,
          body,
          url,
          author: userId,
          status: isDraft ? 'draft' : 'published'
        },
        { // создаем как новый пост
          new: true
        }
      );

      if (!post) {
        res.json({
          ok: false,
          error: 'Пост может редактироваться только его автором!'
        });
      } else {
        res.json({
          ok: true,
          post
        });
      }
      //  else {
      //   // новый пост
      //   const post = await Post.create({
      //     title: title.trim().replace(/ +(?= )/g, ""),
      //     body: body.trim(),
      //     author: userId,
      //     url,
      //     status: isDraft ? 'draft' : 'published'
      //   });

      //   res.json({
      //     ok: true,
      //     post
      //   });
      // }

    }
    catch (err) {
      console.log(err);
      res.json({
        ok: false,
        error: "Ошибка, попробуйте позже!"
      });
    }
  }
});

// edit post
router.get('/edit/:id', async (req, res, next) => {
  const { userId, userLogin } = req.session;
  const id = req.params.id.trim().replace(/ +(?= )/g, "");

  if (!userId && !userLogin) {
    res.redirect('/');
  } else {
    try {
      const post = await Post.findById(id);

      if (!post) {
        const err = new Error('Not Found');
        err.status = 404;
        next(err);
      }

      res.render("post/add", {
        post,
        user: {
          id: userId,
          login: userLogin
        }
      });
    }
    catch (err) {
      console.log(err);
    }
  }

});

module.exports = router;
