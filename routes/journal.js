const express = require('express');
const router = express.Router();
const config = require('../config');
const { Post } = require('../models');
const PageError = require('../error.js');

function posts(req, res) {
    const perPage = Number(config.PER_PAGE);
    const page = req.params.page || 1;

    Post.find({})
        .skip(perPage * page - perPage)
        .limit(perPage)
        .then(posts => {
            Post.count()
                .then(count => {
                    res.render("index", {
                        posts,
                        currentPage: page,
                        pages: Math.ceil(count / perPage),
                        user: {// передаем данные из сессии
                            user: req.session.userId,
                            login: req.session.userLogin
                        }
                    });
                })
                .catch(() => {
                    throw new Error('Server Error');
                })
        })
        .catch(() => {
            throw new Error('Server Error');
        })
}

router.get('/', (req, res) => posts(req, res));
router.get('/?page=:page', (req, res) => posts(req, res));
router.get('/posts/:post', (req, res, next) => {
    const url = req.params.post;

    if (!url) {
        next(new PageError('Page Not Found'));
    } else {
        Post.findOne({
            url
        })
            .then(post => {
                if (post) {
                    res.render("post", {
                        post,
                        user: {
                            user: req.session.userId,
                            login: req.session.userLogin
                        }
                    });
                } else {
                    next(new PageError('Page Not Found'));
                }

            })
    }
})

module.exports = router;