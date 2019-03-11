/**
 * Имя: роуты для урлов начинающихся с /users
 */

var express = require('express');
var router = express.Router();
var model = require('../models/db/db');
var user = require('../models/user/user');
var formidable = require('formidable');
var UserModule = require('../modules/user/user');

router.all('*', function (req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect('/');
        return;
    }
    next();
});

router.get('/profile/:id', function (req, res) {

    model.getUsers({
        user_id: req.params.id
    }).then(function (selectedUser) {
		var params = {}
        if (selectedUser[0].id) {
            params = {
                userInfo: selectedUser[0],
                user: req.user,
                // canEdit: userCanEdit(selectedUser[0], req)
            }
        }
        else {
            params.error = "Пользователь не найден"
        }
        res.render('user/profile/view', params);
    })
});

module.exports = router;