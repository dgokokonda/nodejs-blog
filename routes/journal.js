const express = require('express');
const router = express.Router();
const config = require('../config');
const { Post } = require('../models');

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
                .catch(console.log)
        })
        .catch(console.log)
}

router.get('/', (req, res) => posts(req, res));
router.get('/?page=:page', (req, res) => posts(req, res));

module.exports = router;