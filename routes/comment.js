const express = require("express");
const router = express.Router();

const { Comment } = require("../models");

router.post("/add", async (req, res) => {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;

  if (!userId || !userLogin) {
    res.json({
      ok: false,
      error: "Для отправки комментария требуется авторизация!"
    });
  } else {
    const { post, comment, parent } = req.body;

    try {
      if (comment.length < 3 || comment.length > 255) {
        res.json({
          ok: false,
          error: "Длина комментария должна быть от 3 до 255 символов!",
          fields: ["comment"]
        });
      } else {
        if (!parent) {
          // комменты 0го уровня
          await Comment.create({
            comment,
            post,
            author: userId,
            parent
          });
          res.json({
            ok: true
          });
        } else {
          const parentComment = await Comment.findById(parent);

          if (!parentComment) {
            res.json({
              ok: false
            });
          }

          const newComment = await Comment.create({
            comment,
            post,
            parent,
            author: userId
          });

          const children = parentComment.children;

          children.push(newComment.id);
          parentComment.children = children;
          await parentComment.save();
          res.json({
            ok: true
          });
        }
      }
    } catch (err) {
      res.json({
        ok: false
      });
    }
  }
});

module.exports = router;
