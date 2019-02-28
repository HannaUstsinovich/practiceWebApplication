/**
 * Имя: роуты для /login, /logout, /add-user
 */
var model = require('../models/db/db');
var url = require('url');

module.exports = function (app, passport) {

    app.get('/login', function (req, res) {

        res.render('user/login', {
            login: true,
            blocked: url.parse(req.url, true)['query']['action']
        });
    })

    //sends the request through our local login/signin strategy, and if successful takes user to homepage, otherwise returns then to signin page
    app.post('/login', passport.authenticate('local-login', {
            successRedirect: '/',
            failureRedirect: '/'
        })
    );

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function (req, res) {
        req.logout();
        model.clearSession(req.sessionID).then(function (result) {
            req.session.destroy(function () {
                res.redirect('/')
            });
        })
        //req.session.notice = "You have successfully been logged out " + name + "!";
    });
};
