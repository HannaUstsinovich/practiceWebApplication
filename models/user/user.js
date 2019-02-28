/**
 * Имя: модель юзера
 * Назначение: вспомогательные функции для работы с текущим пользвателем.
 * Например проверить есть ли у пользователя права на какое то действие.
 */
var userRights = require('../../config/user_rights.js');

module.exports = {
    can: function (adminLevel, action) {
        return userRights[adminLevel][action] === true;
    },

    forbid: function(res) {
        res.sendStatus(403);
    }
}