/**
 * Имя: конфиг прав пользователей
 * Назначение: конфиг для разграничения прав пользователей
 */
var userRights = {
    0: { // user
        'add_doc': true,  //  добавлять документы
        // 'edit_doc': true,  // изменять документы
        // 'edit_own_profile': true,  // изменять собственный профиль
        // 'read_own_doc': true,  // читать собственные документы
    },

    2: { // admin
        'add_doc': true,  // добавлять документы
        'add_users': true,  // добавлять пользователя
        // 'change_any_password': true,  // изменять пароль любому пользователю
        // 'edit_doc': true,  // редактировать документы
        // 'edit_any_profile': true,  // редактировать любой профиль
        // 'edit_own_profile': true,  // редактировать собственный профиль
        // 'edit_users': true,  // редактировать пользователей
        // 'read_own_doc': true,  // читать собственные документы
        // 'read_any_doc': true,  // читать любые документы
        // 'update_database': true, // обновлять структуру базы данных
    }
}

module.exports = userRights;