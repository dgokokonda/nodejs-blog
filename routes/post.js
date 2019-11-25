const express = require("express");
const router = express.Router();
const TurndownService = require("turndown");
const { Post } = require("../models");

router.get("/add", (req, res) => {
  res.render("post/add.ejs", {
    user: {
      id: req.session.userId,
      login: req.session.userLogin
    }
  });
});

// router.post('/save', (req, res) => {
//     console.log(req.body)
// });

// publish or save to draft
router.post("/add", async (req, res) => {
  const { title, body, postId, isDraft } = req.body;
  const { userId } = req.session;
  const turndownService = new TurndownService();

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
  } else {
    try {
      if (postId) {
        // редактируемый пост можно сохранить в черновик или опубликовать
        const post = await Post.findOneAndUpdate(
          {
            _id: postId,
            author: userId
          },
          {
            title,
            body,
            // url,
            author: userId,
            status: isDraft ? 'draft' : 'published'
          },
          {
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
      } else {
        // новый пост
        const post = await Post.create({
          title: title.trim().replace(/ +(?= )/g, ""),
          body: turndownService.turndown(body),
          author: userId,
          // url
        });

        res.json({
          ok: true,
          post
        });
      }

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

router.get('/edit/:id', async (req, res, next) => {
  const id = req.params.id.trim().replace(/ +(?= )/g, "");

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
        id: req.session.userId,
        login: req.session.userLogin
      }
    });
  }
  catch (err) {
    console.log(err);
  }
});

module.exports = router;
