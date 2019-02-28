/**
 * Имя: конфигурация-модуль модуля авторизации Passport.
 * Назначение: паспорт отвечает за авторизацию. В этом файле добавлена частная локальная логика
 * нашего приложения (из какой таблицы брать пользователей, какой тип шифровани и т.п).
 * Ядро паспорта лежит в папке node-modules.
 */

// load all the things we need
var LocalStrategy = require('passport-local').Strategy;

// load up the user model
var bcrypt = require('bcrypt-nodejs');

// expose this function to our app using module.exports
module.exports = function (passport, connection) {
    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user.username);
    });

    // used to deserialize the user
    passport.deserializeUser(function (username, done) {
        connection.query("SELECT * FROM users WHERE username = ? ", [username])
            .then(function (rows) {
                done(null, rows[0]);
            })
            .catch(function (err) {
                DEBUG("Error getting user form DB: ", err);
                done(err);
            });
    });

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-login',
        new LocalStrategy({
                usernameField: 'username',
                passwordField: 'password',
                passReqToCallback: true // allows us to pass back the entire request to the callback
            },
            function (req, username, password, done) { // callback with email and password from our form
                connection.query("SELECT * FROM users WHERE username = ?", [username])
                    .then(function (rows) {
                        if (!rows.length) {
                            done(null, false); // req.flash is the way to set flashdata using connect-flash
                        }

                        // if the user is found but the password is wrong
                        else if (!bcrypt.compareSync(password, rows[0].password)) {
                            done(null, false); // create the loginMessage and save it to session as flashdata
                            // all is well, return successful user
                        }
                        else {
                            done(null, rows[0]);
                        }

                    })
                    .catch(function (err) {
                        DEBUG("Login Failed: ", err.body);
                        done(err);
                    });
            })
    );
};
