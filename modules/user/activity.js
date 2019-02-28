/**
 * Имя: модуль юзеров
 * Назначение: создание, редактирование, удаление пользователей
 */
var model = require('../../models/db/db');

module.exports = {
    add: function (userId, action, callback) {
        model.addActivity({
            user_id: userId,
            action: action
        }).then(function (result) {
            if (callback)
                callback(result)
        });
    }
};

