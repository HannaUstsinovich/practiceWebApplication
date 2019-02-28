var path = require('path');
var hbs = require('express-handlebars');
var methodOverride = require('method-override');


Object.defineProperty(global, '__stack', {
    get: function () {
        var orig = Error.prepareStackTrace;
        Error.prepareStackTrace = function (_, stack) {
            return stack;
        };
        var err = new Error;
        Error.captureStackTrace(err, arguments.callee);
        var stack = err.stack;
        Error.prepareStackTrace = orig;
        return stack;
    }
});


Object.defineProperty(global, '__function', {
    get: function () {
        return __stack[2].getFunctionName();
    }
});

module.exports = function (app, express) {

    var exphandlerbars = hbs.create({
        defaultLayout: 'main', //we will be creating this layout shortly
		extname: 'hbs',
		helpers: {
            math: require('../modules/helpers/hjs/math'),
            equal: require('handlebars-helper/lib/helpers/equal.js') // its working!
        }
    });

    app.engine('hbs', exphandlerbars.engine);
    app.set('view engine', 'hbs');

    app.use(methodOverride('X-HTTP-Method-Override'));

    app.use(function (req, res, next) {
        next();
    });

    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('index/error', {
            message: err.message,
            error: err
        });
    });
}