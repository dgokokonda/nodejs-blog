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
                            console.log(user);
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

module.exports = router;