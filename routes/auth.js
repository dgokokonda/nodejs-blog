const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt-nodejs');
const { User } = require('../models');

router.post('/register', (req, res) => {
    const { login, password, passwordConfirm } = req.body;

    if (!login || !password || !passwordConfirm) {
        res.json({
            ok: false,
            error: 'Все поля должны быть заполнены!',
            fields: ['reg-login', 'reg-pass', 'reg-pass-confirm']
        });
    } else if (!/^[a-z\d_-]*$/i.test(login)) {
        res.json({
            ok: false,
            error: 'Логин может содержать только символы латиницы, цифр, дефиса и нижнего подчеркивания!',
            fields: ['reg-login']
        });
    } else if (login.length < 3 || login.length > 16) {
        res.json({
            ok: false,
            error: 'Длина логина от 3 до 16 символов!',
            fields: ['reg-login']
        })
    } else if (password !== passwordConfirm) {
        res.json({
            ok: false,
            error: 'Пароли не совпадают!',
            fields: ['reg-pass', 'reg-pass-confirm']
        })
    } else if (password.length < 6) {
        res.json({
            ok: false,
            error: 'Длина пароля не менее 6 символов!',
            fields: ['reg-pass']
        });
    } else {
        // используем модель юзера
        User.findOne({ // вынужденная проверка на уникальный логин в базе, т.к. unique:true не срабатывает
            login
        }).then(user => {
            if (!user) {
                bcrypt.hash(password, null, null, (err, hash) => {
                    User.create({
                        login,
                        password: hash
                    })
                        .then(user => {
                            req.session.userId = user.id;
                            req.session.userLogin = user.login;
                            res.json({
                                ok: true
                            });
                        })
                        .catch(err => {
                            console.log(err);
                            res.json({
                                ok: false,
                                error: 'Ошибка, попробуйте позже!'
                            });
                        });
                })
            } else {
                res.json({
                    ok: false,
                    fields: ['reg-login'],
                    error: 'Логин уже существует!'
                })
            }
        });
    }
});

router.post('/login', (req, res) => {
    const { login, password } = req.body;

    if (!login || !password) {
        res.json({
            ok: false,
            error: 'Все поля должны быть заполнены!',
            fields: ['auth-login', 'auth-pass']
        });
    } else {
        User.findOne({
            login
        })
            .then(user => {
                if (!user) {
                    // Пользователя с таким логином не существует
                    res.json({
                        ok: false,
                        error: 'Логин и пароль неверны!',
                        fields: ['auth-login', 'auth-pass']
                    });
                } else {
                    // проверка валидности пароля
                    // arguments of password field value, hash from db, callback:
                    bcrypt.compare(password, user.password, (err, valid) => {
                        if (!valid) {
                            res.json({
                                ok: false,
                                error: 'Логин и пароль неверны!',
                                fields: ['auth-login', 'auth-pass']
                            });
                        } else {
                            // вносим данные в сессии (храним в БД)
                            req.session.userId = user.id;
                            req.session.userLogin = user.login;
                            res.json({
                                ok: true
                            });
                        }
                    });
                }
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

router.get('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy(() => {
            res.redirect('/')
        });
    } else {
        res.redirect('/')
    }
})

module.exports = router;