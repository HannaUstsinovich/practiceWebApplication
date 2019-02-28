var paginate = require('express-paginate-bacon');
var config = require('../config/main');

module.exports = function (app) {
    var index = require('./index');
    var docs = require('./docs');
    var user = require('./user');
    var settings = require('./settings');
    // var reports = require('./reports');
    // var search = require('./search');


    app.use(paginate.middleware(config.items_per_page));
    app.use('/', index);
    app.use('/docs', docs);
    app.use('/user', user);
    app.use('/settings', settings);
    // app.use('/reports', reports);
    // app.use('/search', search);
}