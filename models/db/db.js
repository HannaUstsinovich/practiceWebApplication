/**
 * Имя: модель базы
 * Назначение: содержит абсолютно все запросы в базу, которые могут понадобиться в приложении.
 */
var connection;
var colors = require('colors');

module.exports = {
    /**
     * Сохраняем локально ссылку на соединение с базой
     *
     * @param connect
     */
	init: function (connect) {
		connection = connect;
	},

    /**
     * Сам запрос в базу происходи здесь (и логируется в консоль)
     *
     * @param query
     * @returns {*|SearchBuilder}
     */
	query: function (query, log) {
		if (log !== false) {
			DEBUG_MYSQL(colors.blue("Starting mysql query:"));
			DEBUG_MYSQL(colors.inverse(__function));
			DEBUG_MYSQL(colors.cyan(query));
		}

		return connection.query(query);
	},

	bypassFilter: ['resolved', 'future_control_date'],


    /**
     * Создание записи
     *
     * @param fields
     * @returns {*}
     */
	createDoc: function (fields, callback) {
		this.filter(fields, 'iferror');

		var query = "INSERT INTO `records` " +
			"(" +
			"`employee`, " +
			"`service`, " +
			"`book_number`, " +
			"`registration_date`, " +
			"`cc_article`, " +
			"`description`, " +
			"`comment`, " +
			"`decision`, " +
			"`decision_date`, ";

		if (fields.phase && fields.phase_date) {
			query += "`phase`, `phase_date`, ";
		}

		query += "`user_id` " +

			") " +
			"VALUES (" +
			fields.employee + "," +
			fields.service + "," +
			fields.book_number + "," +
			fields.registration_date + "," +
			fields.cc_article + "," +
			fields.description + "," +
			fields.comment + "," +
			fields.decision + "," +
			fields.decision_date + ","

		if (fields.phase && fields.phase_date) {
			console.log("yes it is")
			query += fields.phase + "," + fields.phase_date + ",";
		}

		query +=
			fields.user_id +
			");";

		this.query(query).then(function (data) {
			callback(data)
		});
	},

	/**
     * Добавление идентификатора
     *
     * @param fields
     * @returns {*}
     */

	addIdentifier: function (fields, callback) {
		// this.filter(fields);

		var query = "INSERT INTO `identifiers` " +
			"(`feature`, " +
			"`identifier`, " +
			"`remark`, " +
			"`record_id`" +
			") " +
			"VALUES (" +
			fields.feature + ", " +
			fields.identifier + ", " +
			fields.remark + ", "

		query +=
			fields.record_id +
			");";

		this.query(query).then(function (data) {
			callback(data)
		}).catch((err) => {
			console.log("Failed to query for identifier: " + err)
			return;
		});
	},

	/**
	 * Создание нового пользователя
	 *
	 * @param fields
	 * @returns {*}
	 */
	createUser: function (fields) {
		this.filter(fields);

		var query = "INSERT INTO `users` " +
			"(`username`, " +
			"`password`, " +
			"`fullname`, " +
			"`position`, " +
			"`department`, " +
			"`phone`, " +
			"`email`, " +
			"`admin` " +
			") " +
			"VALUES (" +
			fields.username + "," +
			fields.password + "," +
			fields.fullname + "," +
			fields.position + "," +
			fields.department + "," +
			fields.phone + "," +
			fields.email + "," +
			fields.admin +
			");";

		var self = this;
		return this.query(query).then(function (user) {
			return self.getUsers({ "user_id": user.insertId })
		});
	},


	/**
		 * Получить записи
		 * @param fields
		 * @returns {*|SearchBuilder}
		 */
	getRecords: function (fields) {
		this.filter(fields);

		var query = "SELECT `records`.`*`, `users`.`fullname` AS `username`, " +
			"DATE_FORMAT(`date_created`, '%d.%m.%Y %T') AS `date_created`, " +
			"DATE_FORMAT(`date_modified`, '%d.%m.%Y %T') AS `date_modified`, " +
			"DATE_FORMAT(`registration_date`, '%d.%m.%Y') AS `registration_date` " +
			"FROM `records` JOIN `users` " +
			"ON `records`.`user_id` = `users`.`id` WHERE 1=1";

		if (fields.user_id)
			query += " AND `records`.`user_id` = " + fields.user_id;

		query += " ORDER BY `id` DESC ";

		return this.query(query).catch((err) => {
			console.log("Failed to query for record: " + err)
			return;
		});
	},

	/**
			 * Получить идентификаторы
			 * @param fields
			 * @returns {*|SearchBuilder}
			 */
	getIdentifiers: function (fields) {
		this.filter(fields);

		var query = "SELECT `identifiers`.`*` " +
			"FROM `identifiers` JOIN `records` ON (`identifiers`.`record_id` = `records`.`id`) WHERE 1=1";

		if (fields.doc_id)
			query += " AND `record_id` IN (" + fields.doc_id + ") ";

		query += " ORDER BY `id` DESC ";

		return this.query(query).catch((err) => {
			console.log("Failed to query for user: " + err)
			return
		});
	},

	// getDocs: function (params) {
	// 	this.filter(params);

	// 	var query = "SELECT `records`.`*`, " +
	// 		"DATE_FORMAT(`date_created`, '%d.%m.%Y') AS `date_created`, " +
	// 		"DATE_FORMAT(`registration_date`, '%d.%m.%Y') AS `registration_date`, " +
	// 		"DATE_FORMAT(`decision_date`, '%d.%m.%Y') AS `decision_date` ";

	// 	if (this.isPhaseExists)
	// 		query += ", DATE_FORMAT(`phase_date`, '%d.%m.%Y') AS `phase_date` ";

	// 	query += "FROM `records` JOIN `users` ON (`records`.`user_id` = `users`.`id`) WHERE 1=1 ";

	// 	if (params.doc_id) {
	// 		query += " AND `records`.`id` IN (" + params.doc_id + ") ";
	// 	}

	// 	// if (params.user_id) {
	// 	// 	query += " AND `records`.`user_id`=" + params.user_id;
	// 	// }

	// 	query += " ORDER BY `date_created` DESC ";

	// 	return this.query(query);
	// },

	/**
	 * Получить запись и идентификатор для отображения
	 * @param params
	 * @returns {*|SearchBuilder}
	 */

	getRecordInfo: function (params) {
		this.filter(params);

		var query = "SELECT `records`.`*`,  `identifiers`.`id` as `identifierId`, `identifiers`.`feature`, `identifiers`.`identifier`, `identifiers`.`remark`," +
			"DATE_FORMAT(`date_created`, '%d.%m.%Y %T') AS `date_created`, " +
			"DATE_FORMAT(`date_modified`, '%d.%m.%Y %T') AS `date_modified`, " +
			"DATE_FORMAT(`registration_date`, '%d.%m.%Y') AS `registration_date`, " +
			"DATE_FORMAT(`decision_date`, '%d.%m.%Y') AS `decision_date` ";

		if (this.isPhaseExists)
			query += ", DATE_FORMAT(`phase_date`, '%d.%m.%Y') AS `phase_date` ";

		query += "FROM `records` LEFT OUTER JOIN `identifiers` ON `identifiers`.`record_id` IN (" + params.doc_id + ") " +
			"WHERE 1=1 AND `records`.`id` IN (" + params.doc_id + ") ";

		// if (params.user_id) {
		// 	query += " AND `records`.`user_id`=" + params.user_id;
		// }

		query += " ORDER BY `date_created` DESC ";

		return this.query(query);
	},

	//Проверка, существует ли блок "Срок рассмотрения материала"
	isPhaseExists: function () {
		if ("SELECT phase_date FROM records" == undefined || "SELECT phase FROM records" == undefined)
			return false;
		return true
	},

	/**
	 * Получить пользователя или нескольких
	 *
	 * @param params
	 * @returns {*|SearchBuilder}
	 */
	getUsers: function (params) {
		this.filter(params, 'department');
		var query = "SELECT id, fullname, username, phone, email, " +
			" department, position, admin " +
			" FROM `users` " +
			" WHERE 1=1 ";

		if (params.department) {
			query += " AND `department` IN ('" + params.department.join("','")
				+ "') ";
		}

		if (params.user_id) {
			query += " AND `id` IN (" + params.user_id + ") ";
		}

		// if (params.active) {
		//     query += " AND `blocked` = 0 ";
		// }
		query += "ORDER BY `department`, `fullname` ASC";
		return this.query(query);
	},

	/**
	 * Обновить документ
	 *
	 * @param params
	 * @returns {*|SearchBuilder}
	 */
	updateRecord: function (params, callback) {
		var update = [];
		for (var key in params) {
			if (key != 'doc_id') {
				update.push("  `" + key + "` = '" + params[key] + "' ")
			}
		}

		var query = "UPDATE `records` SET " +
			update.join(",") +
			" WHERE `id`=" + params.doc_id;

		this.query(query).then(function (data) {
			callback(data)
		});
	},

	/**
	 * Обновить документ
	 *
	 * @param params
	 * @returns {*|SearchBuilder}
	 */
	updateIdentifier: function (params, callback) {
		var update = [];
		for (var key in params) {
			if (key != 'doc_id' && key != 'ident_id') {
				update.push("  `" + key + "` = '" + params[key] + "' ")
			}
		}

		var query = "UPDATE `identifiers` SET " +
			update.join(",") +
			" WHERE `id`=" + params.ident_id;

		this.query(query).then(function (data) {
			callback(data)
		});
	},


	/**
	 * Обновить пользователя
	 *
	 * @param params
	 * @returns {*}
	 */
	
	updateUser: function (params) {
	    // this.filter(params);
	    var update = [];
	    for (var key in params) {
	        if (key != 'id') {
	            if (key == 'image' && !params[key]) {
	                continue;
	            }
	            update.push("  `" + key + "` = '" + params[key] + "' ")
	        }
	    }

	    var query = " UPDATE `users` SET " +
	        update.join(",") +
	        " WHERE `id`=" + params.id;

	    var self = this;
	    return this.query(query).then(function () {
	        return self.getUsers({'user_id': params.id})
	    });
	},

	/**
	 * Получить все подразделения (отделы)
	 *
	 * @returns {*|SearchBuilder}
	 */
	// getDepartments: function (params) {
	// 	this.filter(params);
	// 	var query = "SELECT DISTINCT `department` as `name` FROM `users` " +
	// 		" WHERE 1=1 ";
	// 	if (params.user_id) {
	// 		query += " AND id = " + params.user_id
	// 	}
	// 	query += " ORDER BY `department`";
	// 	return this.query(query);
	// },

	// searchDocsByLin: function (params) {
	//     params.lin = '%' + params.lin + '%'
	//     this.filter(params);
	//     var query = "SELECT GROUP_CONCAT(id) as `ids` FROM `docs`" +
	//         " WHERE `doc_index` LIKE " + params.lin + "";
	//     return this.query(query);
	// },

	updateUserPassword: function (userID, password) {
	    userID = connection.escape(userID);
	    password = connection.escape(password);

	    if (userID.length <= 0 || password.length <= 0) {
	        return this.query("SELECT 1")
	    }

	    var query = "UPDATE `users` SET `password` = "
	        + password +
	        " WHERE id=" + userID
	        + " LIMIT 1 ";

	    return this.query(query);
	},

	// blockUser: function (params) {
	//     this.filter(params);
	//     var query = "UPDATE `users` SET `blocked` = 1 " +
	//         " WHERE `id` = " + params.user_id +
	//         " LIMIT 1";

	//     return this.query(query);
	// },

	// unblockUser: function (params) {
	//     this.filter(params);
	//     var query = "UPDATE `users` SET `blocked` = 0 " +
	//         " WHERE `id` = " + params.user_id +
	//         " LIMIT 1";

	//     return this.query(query);
	// },

	ping: function () {
		var query = "SELECT 1";

		this.query(query, false).then(function (result) {
			if (result[0][1] === 1) {
			}
			else {
				throw "Error connecting db, maybe timeout?";
			}
		})
	},

	filter: function (params, exclude) {
		for (var key in params) {
			if (key != exclude
				&& this.bypassFilter.indexOf(key) === -1
				&& (typeof params[key] === "string")) {
				params[key] = connection.escape(params[key]);
			}
		}
	},

	clearSession: function (sessionId) {
		var query = "DELETE FROM `sessions` WHERE `session_id` = '" + sessionId + "'";

		return this.query(query);
	},
}