/**
 * Имя: конфиг прав пользователей
 * Назначение: конфиг для разграничения прав пользователей
 */
var userRights = {
	0: { // user
		'add_doc': true,  //  добавлять документы
		'edit_own_profile': true,  // изменять собственный профиль
		'edit_own_record': true, // редактировать свои записи
	},

	2: { // admin
		'add_doc': true,  // добавлять документы
		'add_users': true,  // добавлять пользователя
		'edit_any_profile': true,  // редактировать любой профиль
		'edit_own_profile': true,  // редактировать собственный профиль
		'edit_own_record': true, // редактировать свои записи
		'edit_any_record': true, // редактировать любые записи
		'change_any_password': true, // изменять любой пароль
		'edit_users': true,  // редактировать пользователей
	}
}

module.exports = userRights;