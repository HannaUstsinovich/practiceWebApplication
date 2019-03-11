/**
 * Имя: роут для главной страницы
 */

var express = require('express');
var promise = require('bluebird');
var router = express.Router();
var passport = require('passport');
var model = require('../models/db/db');
var config = require('../config/main');
var user = require('../models/user/user');


var cache = require('../models/cache/cache');

/* GET home page. */
router.get('/', function (req, res) {
    if (!isLoggedIn(req, res)) {
        return;
    }

    DEBUG_CLIENT(req.user.id, "Зашел на главную");

    if (req.user.blocked) {
        req.logout();
        res.render('user/login', {
            login: true,
            blocked: true
        });
        return;
        // res.render('/login/?blocked=true');
    }

    model.getUsers({department: [req.user.department]}).then(function (users) {
        var userIds = [];
        users.forEach(function (user) { 
            userIds.push(user.id);
        });

        var results = cache.get('mainPageResults' + req.user.id);
        if (results) {
            displayResults(results, req, res);
            return;
        }

        promise.all(
            [
				// Все документы
				// model.getAllRecords(),

                // // Все документы
                // model.getDocsCount({resolved: false}),
                // model.getDocsCount({resolved: true}),
            ]
        ).then(function (result) {
            cache.set('mainPageResults' + req.user.id, result, 3600)
            displayResults(result, req, res)
        });
    })
});

//Отправляет запрос через нашу локальную стратегию регистрации, и в случае успеха принимает пользователя на главную страницу,
// в противном случае возвращается на страницу входа
router.post('/local-reg', passport.authenticate('local-signup', {
        successRedirect: '/',
        failureRedirect: '/'
    })
);

function displayResults(result, req, res) {
    res.render('index/home', {
        // Актуальные документы:
        //
        //  - созданные мной
        //  - на моем контроле
        //  - порученные мне

        // Завершенные документы:
        //  - созданные мной
        //  - на моем контроле
        //  - порученные мне
        //  - завершенные мной

        // Все
        // - активные
        // - закрытые

        current: {
            // 'mine': result[0][0].count,
            // 'control': result[1][0].count,
            // 'assigned': result[2][0].count
        },
        // resolved: {
        //     'mine': result[3][0].count,
        //     'control': result[4][0].count,
        //     'assigned': result[5][0].count,
        //     'closed': result[6][0].count,
        // },

        // all: {
        //     'current': result[7][0].count,
        //     'closed': result[8][0].count
        // },

        user: req.user,
        // can_read_any_doc: user.can(req.user.admin, "read_any_doc"),
        // can_view_reports: user.can(req.user.admin, "view_reports"),
        can_add_doc: user.can(req.user.admin, "add_doc"),
        // can_change_settings: user.can(req.user.admin, "change_settings"),
        is_default_assignee: isDefaultAssignee(req.user.id)
    });
}

/**
 * @returns {boolean}
 */
function isDefaultAssignee(userId) {
    for (var key in config.defaultAssignees) {
        if (userId == config.defaultAssignees[key]) {
            return true;
        }
    }
    return false;
}

// route middleware to make sure
function isLoggedIn(req, res) {
    if (req.isAuthenticated()) {
        return true;
    }

    // if they aren't redirect them to the home page
    res.redirect('/login');
}

module.exports = router;
