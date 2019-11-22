const express = require('express');
const router = express.Router();
const config = require('../config');
const { Post, User } = require('../models');
const PageError = require('../error.js');

function posts(req, res, user) {
    const perPage = Number(config.PER_PAGE);
    const page = req.params.page || 1;
    const findUser = user && user.id ? { author: user.id } : {};
    const path = user && user.id ? `/users/${req.params.login}` : '';

    Post.find(findUser)
        .skip(perPage * page - perPage)
        .limit(perPage)
        .populate('author') // по id находим это поле в др.таблице
        .sort({ createdAt: -1 }) // сортировка записей в обратном порядке
        .then(posts => {
            Post.count(findUser)
                .then(count => {
                    res.render("index", {
                        // _user: user,
                        posts,
                        path,
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
        }).populate('author')
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
});

router.get('/users/:login/:page*?', (req, res) => {
    const login = req.params.login;

    User.findOne({
            login
        })
            .then(user => {
                posts(req, res, user)
            });
});



module.exports = router;