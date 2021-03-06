/**
* Имя: роуты для урлов начинающихся с /docs
*/

var express = require('express');
var router = express.Router();
var model = require('../models/db/db');
var config = require('../config/main');
var path = require('path');
var fs = require('fs');
var promise = require("bluebird");
var user = require('../models/user/user');
var url = require('url');
var UserModule = require('../modules/user/user');
var cache = require('../models/cache/cache');
var paginate = require('express-paginate-bacon');
var os = require('os');
os.tmpDir = os.tmpdir;
var formidable = require('formidable');

router.all('*', function (req, res, next) {
	if (!req.isAuthenticated()) {
		res.redirect('/');
	}
	next();
});

// Добавление записи
router.post('/new', function (req, res) {
	cache.flushAll();
	var form = new formidable.IncomingForm();

	form.multiples = true;

	var properfields = {};

	form.on('field', function (name, value) {
		if (!properfields[name]) {
			properfields[name] = value;
		} else {
			if (properfields[name].constructor.toString().indexOf("Array") > -1) { // is array
				properfields[name].push(value);
			} else { // not array
				var tmp = properfields[name];
				properfields[name] = [];
				properfields[name].push(tmp);
				properfields[name].push(value);
			}
		}
	});

	form.parse(req, function (err, fields, files) {
		fields = properfields;

		saveDoc(fields, req, res, function (savedDocParams) {
			if (savedDocParams.success) {
				if (fields.feature != undefined) {
					//Блок для добавления идентификатора
					fields.record_id = savedDocParams.record_id;
					saveIdentifier(fields, req, res, function (savedIdentifierParams) {
						if (savedIdentifierParams.success) {
							res.setHeader('Content-Type', 'application/json');
							res.end(JSON.stringify(savedIdentifierParams));
						}
						return;
						// 	res.render('docs/saved_record', savedDocParams);
						// return;
					})
				}
				else {
					res.setHeader('Content-Type', 'application/json');
					res.end(JSON.stringify(savedDocParams));
					return;
				}
			}
		});
	});
})


router.get('/new/', function (req, res) {
	renderForm(req, res);
})

var renderForm = function (req, res) {
	// console.log(req.user.admin)
	if (!user.can(req.user.admin, "add_doc")) {
		res.sendStatus(403);
		return;
	}

	var pathDocHelp = req.params.doc + '.txt';

	fs.readFile(pathDocHelp, function (err, content) {

		if (err) {
			DEBUG(err);
		}
		var params = req.params;

		params.docContent = content;
		params.user = req.user;
		params.doc = req.params.doc;

		res.render('docs/add_record', params)
	});
}

//Сохранение записи
var saveDoc = function (fields, req, res, callback) {

	fields.user_id = req.user.id;

	model.createDoc(fields, function (rows) {
		var params = {
			user: req.user,
		}

		if (rows === false) {
			params.error = true;
			params.message = "Ошибка во время сохранения, запись уже существует";
			res.render('docs/saved_record', params);
			return;
		}

		var recordId = rows.insertId;

		params.record_id = recordId;

		if (rows.affectedRows == 1) {
			params.success = true;
			params.message = "Запись сохранена успешно";
			params.messageType = "primary";
		}
		else {
			params.success = false;
			params.message = "Ошибка во время сохранения";
			res.render('docs/saved_record', params);
		}

		callback(params);
	})
}

// Получить все записи
router.get('/all', function (req, res) {
	// if (!user.can(req.user.admin, "read_any_doc")) {
	//     res.sendStatus(403);
	// }

	var fields = {};

	model.getRecords(fields).then(function (records) {
		var cleanIdsSource = req.body.clean ? req.body.clean.split(",") : [];
		var errorIdsSource = req.body.error ? req.body.error.split(",") : [];

		var params = {
			user: req.user,
			records: paginate.slice(req)(records),
			pages: paginate.getPages(req, res)(records.length),
			showIds: false,
			postPage: true,
			cleanIdsSource: cleanIdsSource,
			errorIdsSource: errorIdsSource
		}
		res.render('docs/list/all_records', params);
	})
})

// Получить записи текущего пользователя
router.get('/user/:id', function (req, res) {

	var fields = {
		user_id: req.params.id
	};

	model.getRecords(fields).then(function (records) {
		var cleanIdsSource = req.body.clean ? req.body.clean.split(",") : [];
		var errorIdsSource = req.body.error ? req.body.error.split(",") : [];

		var params = {
			user: req.user,
			records: paginate.slice(req)(records),
			pages: paginate.getPages(req, res)(records.length),
			showIds: false,
			postPage: true,
			cleanIdsSource: cleanIdsSource,
			errorIdsSource: errorIdsSource
		}
		res.render('docs/list/user_records', params);
	})
})

// Получить все идентификаторы
router.get('/identifiers', function (req, res) {

	var fields = {};

	model.getIdentifiers(fields).then(function (identifiers) {
		var cleanIdsSource = req.body.clean ? req.body.clean.split(",") : [];
		var errorIdsSource = req.body.error ? req.body.error.split(",") : [];
		var params = {
			user: req.user,
			identifiers: paginate.slice(req)(identifiers),
			pages: paginate.getPages(req, res)(identifiers.length),
			showIds: false,
			postPage: true,
			cleanIdsSource: cleanIdsSource,
			errorIdsSource: errorIdsSource
		}
		res.render('docs/list/all_identifiers', params);
	})
})

// Добавление идентификатора
router.post('/:id/info/add/identifier', function (req, res) {
	cache.flushAll();
	var form = new formidable.IncomingForm();
	var record_id = req.params.id;

	form.multiples = true;

	form.parse(req, function (err, fields) {
		for (var key in fields) {
			if (fields.hasOwnProperty(key)) {
				fields[key] = "'" + fields[key] + "'";
			}
		}

		fields.record_id = record_id;

		saveIdentifier(fields, req, res, function (savedIdentifierParams) {
			res.setHeader('Content-Type', 'application/json');
			res.end(JSON.stringify(savedIdentifierParams));
			return;
		});
	});
})

var saveIdentifier = function (fields, req, res, callback) {
	model.addIdentifier(fields, function (rows) {

		var params = {}

		var identifierId = rows.insertId;

		params.identifier_id = identifierId;

		if (rows.affectedRows == 1) {
			params.success = true;
			params.message = "Запись сохранена успешно";
			params.messageType = "primary";
		}
		else {
			params.error = true;
			params.success = false;
			params.message = "Ошибка во время сохранения";
		}

		callback(params);
	})
}

//ВСЕ ДОКУМЕНТЫ ВООБЩЕ
// router.get('/active/all', function (req, res) {
//     if (!user.can(req.user.admin, "read_any_doc")) {
//         res.sendStatus(403);
//     }

//     var params = {
//         resolved: false
//     };

//     model.getDocs(params).then(function (docs) {

//         var params = {
//             title: "Все документы",
//             user: req.user,
//             docs: paginate.slice(req)(docs),
//             pages: paginate.getPages(req, res)(docs.length)
//         }
//         res.render('docs/list/all', params);
//     })
// })

// //ВСЕ ДОКУМЕНТЫ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ
// router.get('/created/personal', function (req, res) {

//     var params = {};
//     params.user_id = req.user.id;

//     promise.all([
//         model.getDocs(params)
//     ]).then(function (result) {

//         var params = {
//             title: "Документы, добавленные мной",
//             user: req.user,
//             docs: paginate.slice(req)(result[0]),
//             pages: paginate.getPages(req, res)(result[0].length)
//         }
//         res.render('docs/list/all', params);
//     })
// })

// Отобразить документ полностью
router.get('/:id/info', function (req, res) {
	var params = {};
	var render = 'docs/info';

	params.doc_id = req.params.id;

	model.getRecordInfo(params).then(function (result) {
		var doc = result[0];

		if (result[0].feature != null && result[0].feature != undefined) {
			var identifiers = getIdentifiersObject(result);
			delete doc.feature;
			delete doc.identifier;
			delete doc.remark;
		}

		if (typeof doc == "undefined") {
			res.sendStatus(403);
			return;
		}

		var params = {
			doc: doc,
			identifiers: identifiers,
			user: req.user,
			can_edit_record: canEditRecord(doc, req)
			// can_edit_doc: user.can(req.user.admin, "edit_doc"),
			// can_remove_doc: canRemoveDoc(doc, req),
		}

		res.render(render, params);
	})
})

function getIdentifiersObject(obj) {
	var identifiers = {}

	for (var k = 0; k < obj.length; k++) {
		var temp = {}
		Object.keys(obj[k]).forEach(function (key) {
			if (key == "identifierId" || key == "feature" || key == "identifier" || key == "remark")
				temp[key] = obj[k][key];
		});
		identifiers[k] = temp;
	}
	return identifiers;
}

//ОБНОВЛЕНИЕ ДОКУМЕНТА
// router.post('/:doc_id/update', function (req, res) {
//     cache.flushAll();

//     if (!user.can(req.user.admin, "edit_doc")) {
//         res.sendStatus(403);
//         return;
//     }

//     var params = req.body;
//     params.id = req.params.doc_id;
//     params.table = 'docs_' + req.params.type;
//     model.updateDoc(params).then(function (rows) {
//         res.setHeader('Content-Type', 'application/json');
//         res.send(JSON.stringify({
//             affected_rows: rows.affectedRows
//         }));
//     })
// })

router.put('/:id/edit', function (req, res) {

	cache.flushAll();
	var form = new formidable.IncomingForm();

	var doc_id = req.params.id;

	if (!user.can(req.user.admin, "edit_own_record") && !user.can(req.user.admin, "edit_any_record")) {
		res.sendStatus(403);
		return;
	}

	form.multiples = true;

	form.parse(req, function (err, fields) {
		fields.doc_id = doc_id;

		model.updateRecord(fields, function (rows) {
			var params = {
				// user: req.user,
			}
			if (rows.affectedRows == 1) {
				params.success = true;
			}
			else {
				params.success = false;
			}

			res.setHeader('Content-Type', 'application/json');
			res.end(JSON.stringify(params));
			return;
		})
	});
})

router.put('/:doc_id/edit/:ident_id/identifier', function (req, res) {

	cache.flushAll();
	var form = new formidable.IncomingForm();

	var doc_id = req.params.doc_id;
	var ident_id = req.params.ident_id;

	if (!user.can(req.user.admin, "edit_own_record") && !user.can(req.user.admin, "edit_any_record")) {
		res.sendStatus(403);
		return;
	}

	form.multiples = true;

	form.parse(req, function (err, fields) {
		fields.doc_id = doc_id;
		fields.ident_id = ident_id;

		model.updateIdentifier(fields, function (rows) {
			var params = {
				user: req.user,
			}
			if (rows.affectedRows == 1) {
				params.success = true;
			}
			else {
				params.success = false;
			}

			res.setHeader('Content-Type', 'application/json');
			res.end(JSON.stringify(params));
			return;
		})
	});
})

// router.get('/:id/:action?', function (req, res) {
//     var params = {};
//     var render = req.params.action == 'edit' ? 'docs/edit' : 'docs/info';
//     // var print = req.params.action == 'print';

//     params.doc_id = req.params.id;
// 	// params.active_only = true;
// 	model.getDocs(params).then(function (result) {
//         // var doc = populateStatus(result[0][0], req.user.id);
// 		var doc = paginate.slice(req)(result);
// 		console.log(doc);

//         if (typeof doc == "undefined") {
//             res.sendStatus(403);
//             return;
//         }
//         // var controllers = result[1];
//         // var assigners = result[2];

//         var params = {
// 			doc: doc,
//             // controllers: controllers,
//             // assigners: assigners,
//             user: req.user,
//             // can_edit_doc: user.can(req.user.admin, "edit_doc"),
//             // can_remove_doc: canRemoveDoc(doc, req),
//         }

//         // if (print) {
//         //     params.print = true;
//         //     params.layout = false;
//         // }

//         res.render(render, doc);
//     })
// })

// router.get('/:doc_id/user/:user_id/date/:date/control/forward', function (req, res) {
//     cache.flushAll();
//     var self = this;

//     model.moveControlForward({
//         user_id: req.params.user_id,
//         doc_id: req.params.doc_id,
//         date: formatDate(req.params.date)
//     }).then(function (rows) {
//         res.redirect('/docs/' + req.params.doc_id + '/info');
//     });
// })

//ОБНОВЛЕНИЕ ДОКУМЕНТА
// router.post('/:doc_id/update', function (req, res) {
//     cache.flushAll();
//     DEBUG_CLIENT(req.user.id, "Обновил документ");

//     if (!user.can(req.user.admin, "edit_doc")) {
//         res.sendStatus(403);
//         return;
//     }

//     var params = req.body;
//     params.id = req.params.doc_id;
//     params.table = 'docs_' + req.params.type;
//     model.updateDoc(params).then(function (rows) {
//         res.setHeader('Content-Type', 'application/json');
//         res.send(JSON.stringify({
//             affected_rows: rows.affectedRows
//         }));
//     })
// })

/**
 * 1. has superpower
 * 2. created doc himself
 *
 * @param user
 * @param doc
 * @returns {boolean}
 */

// var deleteFolderRecursive = function (path) {
//     if (fs.existsSync(path)) {
//         fs.readdirSync(path).forEach(function (file, index) {
//             var curPath = path + "/" + file;
//             if (fs.lstatSync(curPath).isDirectory()) { // recurse
//                 deleteFolderRecursive(curPath);
//             } else { // delete file
//                 fs.unlinkSync(curPath);
//             }
//         });
//         fs.rmdirSync(path);
//     }
// };


/**
 * 1. has superpower
 * 2. created doc himself
 *
 * @param user
 * @param doc
 * @returns {boolean}
 */
var canEditRecord = function (doc, req) {
	if (doc.user_id == req.user.id && user.can(req.user.admin, "edit_own_record")) {
		return true;
	}

	if (user.can(req.user.admin, "edit_any_record")) {
		return true;
	}

	return false;
}

module.exports = router;