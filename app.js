/**
 * Имя: Заглавный файл
 *
 * Назначение: Точка входа приложение. Здесь подключаются все роуты, происходит соединение с базой,
 * определяется что чем будет управлять и т.п.
 * @type {number}
 */

var webPort = 9000;

DEBUG = require('debug')('app')
DEBUG_MYSQL = require('debug')('mysql')
DEBUG_CLIENT = require('debug')('client')

var mysql = require('promise-mysql');
var dbConfig = require('./config/database');
var model = require('./models/db/db'); //----------
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);;
var package = require('./package.json');
var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var Crypto = require('crypto');
var compression = require('compression');
var path = require('path');
DEBUG("orpsvt v%s", package.app_version)

var app = express();

var age = 3600;
app.use(express.static(path.join(__dirname, '/public'), {maxAge: age})); //----------
app.use(express.static(path.join(__dirname, '/node_modules/bootstrap/dist'), {maxAge: age})); //----------
app.use(express.static(path.join(__dirname, '/node_modules/jquery/dist'), {maxAge: age})); //----------
app.use(express.static(path.join(__dirname, '/node_modules'), {maxAge: age})); //----------
app.use(express.static(path.join(__dirname, '/bower'), {maxAge: age})); //----------

app.use(compression());

mysql.createConnection(dbConfig.connection).then(
	function(connection){
		dbConfig.init(connection);
		model.init(connection);
		var sessionStore = new MySQLStore({}, connection);
		app.use(bodyParser.json());
		app.use(bodyParser.urlencoded({extended: false}));
		app.use(session({
            name: 'register.sid',
            secret: 'keyboard cat',
            cookie: {maxAge: 9 * 60 * 60 * 1000},
            resave: false,
            saveUninitialized: false,
            store: sessionStore,
            genid: function (req) {

                if (!req.body.username) {
                    return;
                }

                var time = new Date().getTime();
                var headers = req.headers;
                var rand = Math.random()
                var secret =
                    time
                    + rand
                    + req.headers.cookie
                    + headers['user-agent']
                    + req.headers.accept
                    + req.headers['accept-encoding'];


                secret = req.body.username + '___' + Crypto.createHmac('sha256', secret)
                    .update('I love cupcakes')
                    .digest('hex');
                return secret;
            }
		}))
		
		var ping = function () {
            setTimeout(function () {
                ping();
            }, 600000);
        }
		ping();

		app.use(passport.initialize());
        app.use(passport.session());


        require('./config/passport')(passport, connection); // pass passport for configuration
        require('./config/!boot.js')(app, express);
        require('./routes/!boot.js')(app);
        require('./routes/login.js')(app, passport); // load our routes and pass in our app and fully configured passport
		
		var port = process.env.PORT || webPort; //select your port or let it pull from your .env file
        app.listen(port);
        DEBUG("Started on port " + port);
	}
);

module.exports = app;