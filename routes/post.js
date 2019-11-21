const express = require('express');
const router = express.Router();
const TurndownService = require('turndown');
const { Post } = require('../models');

router.get('/add', (req, res) => {
    res.render('post/add.ejs', {
        user: {
            id: req.session.userId,
            login: req.session.userLogin
        }
    });
});

// router.post('/save', (req, res) => {
//     console.log(req.body)
// });

router.post('/publish', (req, res) => {
    const { title, body, htmlData } = req.body;
    const turndownService = new TurndownService();

    if (!title || !body) {
        res.json({
            ok: false,
            error: 'Все поля должны быть заполнены!',
            fields: ['post-title', 'post-body']
        });
    } else if (title.length < 3 || title.length > 50) {
        res.json({
            ok: false,
            error: 'Длина заголовка должна быть от 3 до 50 символов!',
            fields: ['post-title']
        });
    } else if (body.length < 3 || body.length > 500) {
        res.json({
            ok: false,
            error: 'Длина записи должна быть от 3 до 500 символов!',
            fields: ['post-body']
        });
    } else {
        Post.create({
            title: title.trim().replace(/ +(?= )/g, ''),
            body: turndownService.turndown(htmlData),
            author: req.session.userId
        })
            .then(post => {
                console.log(post)
                res.json({
                    ok: true
                })
            })
            .catch(err => {
                console.log(err);
                res.json({
                    ok: false,
                    error: 'Ошибка, попробуйте позже!'
                });
            });

    }
});

module.exports = router;