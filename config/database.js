/**
 * Имя: конфиг базы
 * Назначение: данные доступа к базе + sql код для инициации приложения.
 * Отрабатывает 1 раз при старте, дальше используется созданное подключение.
 */


module.exports = {
    connection: {
        'host': 'localhost',
        'user': 'root',
        'password': '1234!aUst',
        'database': 'appdb',
        'admin_id': 2
    },

    init: function (connection) {
        // nothing to do here
    }
};