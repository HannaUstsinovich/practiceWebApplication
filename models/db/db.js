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

		if (fields.phase && fields.phase_date){
			console.log("yes it is")
			query += fields.phase + "," + fields.phase_date + ",";
		}

		query +=
			fields.user_id +
			");";

			console.log(query)
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


	//Добавление идентифкатора
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
			"DATE_FORMAT(`date_created`, '%d.%m.%Y') AS `date_created`, " +
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



	/**
	 * Получить список докуметов, которые находятся на контроле
	 * (у определенного пользователя или у всех сразу)
	 *
	 * @param params
	 * @returns {*|SearchBuilder}
	 */
	//     getDocsUnderControl: function (params) {
	//         this.filter(params);
	//         if (params.count) {
	//             var query = " SELECT COUNT(*) as `count` ";
	//         } else {
	//             var query = " SELECT `user_control`.`date_added`, " +
	//                 "`user_control`.`date_removed`, `docs`.*, `u`.`name` as `username`, ";
	//             if (params.removed) {
	//                 query += " 0 as `control` ";
	//             } else {
	//                 query += " 1 as `control` ";
	//             }
	//         }

	//         query += " FROM user_control \
	//         JOIN `docs` on `docs`.id = user_control.doc_id\
	//         JOIN `users` `u` ON `user_control`.`user_id` = `u`.`id`\
	//         WHERE 1=1"

	//         if (params.user_id) {
	//             query += " AND `user_control`.`user_id` = " + params.user_id;
	//         }

	//         if (params.active_control) {
	//             query += " AND `date_removed` IS NULL ";
	//         }

	//         if (params.current_control) {
	//             query += " AND `user_control`.`date_added` <= CURDATE() ";
	//         }

	//         if (params.resolved && params.resolved === true) {
	//             query += " AND `docs`.`date_resolved` IS NOT NULL ";
	//         }

	//         if (params.resolved === false) {
	//             query += " AND `docs`.`date_resolved` IS NULL ";
	//         }

	//         return this.query(query);
	//     },
	// // Получение документов на данный момент поручено
	//     getDocsUnderAssign_simplified: function (params) {


	//         this.filter(params);
	//         var query = " SELECT COUNT(DISTINCT `doc_id`) as `count`, GROUP_CONCAT(DISTINCT `doc_id`) as `ids`";

	//         query += " FROM user_assign " +
	//             " JOIN `docs` on `docs`.`id` = `user_assign`.`doc_id` " +
	//             " WHERE `docs`.`date_resolved` IS NULL "

	//         if (params.date_added_left) {
	//             query += " AND `user_assign`.`date_added` >= " + params.date_added_left;
	//         }

	//         if (params.date_added_right) {
	//             query += " AND `user_assign`.`date_added` < " + params.date_added_right;
	//         }

	//         if (params.date_removed_left) {
	//             query += " AND `user_assign`.`date_removed` >= " + params.date_removed_left;
	//         }

	//         if (params.date_removed_right) {
	//             query += " AND `user_assign`.`date_removed` < " + params.date_removed_right;
	//         }

	//         if (params.userIds) {
	//             query += " AND  `user_assign`.`user_id` IN (" + params.userIds + ") ";
	//         }

	//         return this.query(query);
	//     },

	// Получение документов на данный момент на контроле
	// getDocsUnderControl_simplified: function (params) {
	//     this.filter(params);
	//     var query = " SELECT COUNT(DISTINCT `doc_id`) as `count`, GROUP_CONCAT(DISTINCT `doc_id`) as `ids`";

	//     query += " FROM user_control\
	//             WHERE 1=1 ";

	//     if (params.date_added_left) {
	//         query += " AND `user_control`.`date_added` >= " + params.date_added_left;
	//     }

	//     if (params.date_added_right) {
	//         query += " AND `user_control`.`date_added` < " + params.date_added_right;
	//     }

	//     query += " AND `user_control`.`date_removed` is null";

	//     if (params.userIds) {
	//         query += " AND `user_id` IN (" + params.userIds + ") ";
	//     }

	//     return this.query(query);
	// },


	/**
	 * Получить список назначеных документов.
	 *
	 *
	 * @param params
	 * @returns {*|SearchBuilder}
	 */
	// getDocsUnderAssign: function (params) {
	//     this.filter(params, 'userIds');
	//     if (params.count) {
	//         var query = "SELECT COUNT(*) as `count` ";
	//     } else {
	//         var query = "SELECT \
	//                 `user_assign`.`date_added`,\
	//             `user_assign`.`date_removed`,\
	//             `docs`.*,\
	//             `u1`.`name` as `username_assign`,\
	//             `u2`.`name` as `username`,\
	//             'error' as `type`, 1 AS `iferror`,";

	//         if (params.include_ids) {
	//             query += " GROUP_CONCAT(`docs`.`id`) as `ids`, "
	//         }

	//         if (params.removed) {
	//             query += " 0 as `assign` ";

	//         } else {
	//             query += " 1 as `assign` ";
	//         }


	//     }

	//     query += "FROM user_assign\
	//             JOIN `docs` on `docs`.id = user_assign.doc_id\
	//             JOIN `users` `u1` ON `user_assign`.`user_id` = `u1`.`id`\
	//             JOIN `users` `u2` ON `docs`.`user_id` = `u2`.`id`\
	//             WHERE 1=1 ";

	//     if (params.active_only) {
	//         query += " AND `docs`.`date_resolved` IS NULL ";
	//     }

	//     if (params.date_added_left) {
	//         query += " AND `user_assign`.`date_added` >= " + params.date_added_left;
	//     }

	//     if (params.date_added_right) {
	//         query += " AND `user_assign`.`date_added` <= " + params.date_added_right;
	//     }

	//     if (params.date_removed_left) {
	//         query += " AND `user_assign`.`date_removed` >= " + params.date_removed_left;
	//     }

	//     if (params.date_removed_right) {
	//         query += " AND `user_assign`.`date_removed` <= " + params.date_removed_right;
	//     }


	//     if (params.userIds) {
	//         query += " AND `user_assign`.`user_id` IN (" + params.userIds.join(",") + ")";
	//     }
	//     else if (params.user_id) {
	//         query += " AND `user_assign`.`user_id` = " + params.user_id;
	//     }

	//     if (params.resolved && params.resolved === true) {
	//         query += " AND `docs`.`date_resolved` IS NOT NULL ";
	//     }

	//     else if (params.resolved === false) {
	//         query += " AND `docs`.`date_resolved` IS NULL  ";
	//     }

	//     if (params.group_by_supplement) {
	//         query += " GROUP BY `doc_id` ";
	//     }

	//     return this.query(query);
	// },

	/**
	 * Получить количество документов
	 *
	 * @param params
	 * @returns {*|SearchBuilder}
	 */
	// getDocsCount: function (params) {
	//     this.filter(params, 'user_id');
	//     // this.filter(params);
	//     var query = "SELECT COUNT(*) as `count` "

	//     if (params.group_by_supplement) {
	//         query += ", `supplement` "
	//     }

	//     if (params.include_ids) {
	//         query += ", GROUP_CONCAT(`records`.`id`) as `ids` "
	//     }

	//     query += " FROM `records` " +
	//         " WHERE 1=1 ";
	//     if (params.user_id) {
	//         query += " AND `user_id`=" + params.user_id;
	//     }

	//     // if (params.resolved === false) {
	//     //     query += " AND date_resolved IS NULL ";
	//     // }

	//     // if (params.resolved === true) {
	//     //     query += " AND date_resolved IS NOT NULL ";
	//     // }

	//     if (params.userIds) {
	//         var userIds = params.userIds;
	//         query += " AND `user_id` IN (" + userIds + ") ";
	//     }

	//     if (params.date_added_left) {
	//         query += " AND `date_added` >= " + params.date_added_left;
	//     }

	//     if (params.date_added_right) {
	//         query += " AND `date_added` < " + params.date_added_right;
	//     }

	//     if (params.date_resolved_left) {
	//         query += " AND `date_resolved` >= " + params.date_resolved_left;
	//     }

	//     if (params.date_resolved_right) {
	//         query += " AND `date_resolved` < " + params.date_resolved_right;
	//     }

	//     if (params.group_by_supplement) {
	//         query += " GROUP BY `supplement` ";
	//     }

	//     return this.query(query);
	// },

	/**
	 * Получить документы
	 * @param params
	 * @returns {*|SearchBuilder}
	 */
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

	getDocs: function (params) {
		this.filter(params);

		var query = "SELECT `records`.`*`, `identifiers`.`feature`, `identifiers`.`identifier`, `identifiers`.`remark`," +
			"DATE_FORMAT(`date_created`, '%d.%m.%Y') AS `date_created`, " +
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
	 * Получить список тех, кто контролирует документы
	 *
	 * @param params
	 * @returns {*|SearchBuilder}
	 */
	// getDocControllers: function (params) {
	//     var query = "SELECT `user_control`.*, `users`.`name` as `name`, `users`.`id` as `user_id`, " +
	//         " DATE_FORMAT(`date_added`, '%d.%m.%Y') as `date_added`, " +
	//         " DATE_FORMAT(`date_removed`, '%d.%m.%Y') as `date_removed`, " +
	//         "`users`.`department` as `user_department` " +
	//         "FROM `user_control` " +
	//         "JOIN `users` ON `users`.`id` = `user_control`.`user_id` " +
	//         "WHERE `doc_id`=" + params.doc_id;

	//     if (params.active_only) {
	//         query += " AND `date_removed` IS NULL";
	//     }

	//     return this.query(query);
	// },

	/**
	 * Собрать все возможные варианты описания ошибки
	 *
	 * @param params
	 * @returns {*|SearchBuilder}
	 */
	// getErrorReasonsList: function (params) {
	//     this.filter(params);
	//     var query = "SELECT DISTINCT `description` " +
	//         "FROM `docs` " +
	//         "ORDER BY `description`";
	//     return this.query(query);
	// },

	/**
	 * Обновить документ
	 *
	 * @param params
	 * @returns {*|SearchBuilder}
	 */
	// updateDoc: function (params) {
	//     var update = [];
	//     for (var key in params) {
	//         if (key != 'id' && key !== 'table') {
	//             update.push("  `" + key + "` = '" + params[key] + "' ")
	//         }
	//     }

	//     var query = "UPDATE `" + params.table + "` SET " +
	//         update.join(",") +
	//         " WHERE `id`=" + params.id;

	//     return this.query(query);
	// },


	// /**
	//  * Обновить пользователя
	//  *
	//  * @param params
	//  * @returns {*}
	//  */
	// updateUser: function (params) {
	//     // this.filter(params);
	//     var update = [];
	//     for (var key in params) {
	//         if (key != 'id') {
	//             if (key == 'image' && !params[key]) {
	//                 continue;
	//             }
	//             update.push("  `" + key + "` = '" + params[key] + "' ")
	//         }
	//     }

	//     var query = " UPDATE `users` SET " +
	//         update.join(",") +
	//         " WHERE `id`=" + params.id;

	//     var self = this;
	//     return this.query(query).then(function () {
	//         return self.getUsers({'user_id': params.id})
	//     });
	// },

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

	// updateUserPassword: function (userID, password) {
	//     userID = connection.escape(userID);
	//     password = connection.escape(password);

	//     if (userID.length <= 0 || password.length <= 0) {
	//         return this.query("SELECT 1")
	//     }

	//     var query = "UPDATE `users` SET `password` = "
	//         + password +
	//         " WHERE id=" + userID
	//         + " LIMIT 1 ";

	//     return this.query(query);
	// },

	// filterDocsError: function (userId, docIds) {
	//     if (!docIds.length) {
	//         return;
	//     }

	//     userId = connection.escape(userId);
	//     // docIds = connection.escape(docIds);
	//     var queryErroDocs = "SELECT COUNT(*) as `count`, id FROM `docs` WHERE `id` IN " +
	//         " (" + docIds.join(",") + ")" +
	//         " AND user_id = " + userId +
	//         " GROUP BY `id`";

	//     return this.query(queryErroDocs);
	// },

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