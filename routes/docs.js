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

// Добавление документа
router.post('/new', function (req, res) {
	cache.flushAll();
	var form = new formidable.IncomingForm();

	form.multiples = true;

	var properfields = {};

	form.on('field', function (name, value) {
		// console.log('on field');
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

		DEBUG_CLIENT(req.user.id, "Добавил документ");

		saveDoc(fields, req, res, function (savedDocParams) {
			if (savedDocParams.success) {

				// if (files.files.length == undefined) {
				//     files = {files: [files.files]};
				// }

				for (var key in files.files) {
					saveDocFile(files.files[key], savedDocParams.record_id);
				}
			}
			res.render('docs/saved_record', savedDocParams);
			return;
		});
	}
	);
})


router.get('/new/', function (req, res) {
	renderForm(req, res);
})


var renderForm = function (req, res) {
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

var formatDate = function (date) {
	if (!date) {
		return false;
	}

	var arr = date.split(".");
	return [arr[2], arr[1], arr[0]].join(".");
}

//Сохранение документа
var saveDoc = function (fields, req, res, callback) {
	
	fields.user_id = req.user.id;
	fields.date = formatDate(fields.date);

	model.createDoc(fields, function (rows) {

		var params = {
			user: req.user,
		}

		if (rows === false) {
			params.error = true;
			params.message = "Ошибка во время сохранения, документ уже существует";
			res.render('docs/saved_record', params);
			return;
		}

		var recordId = rows.insertId;
		var userId = req.user.id;

		params.record_id = recordId;

		//Блок для добавления идентификатора
		fields.record_id = recordId;
		if (fields.feature != undefined)
			model.addIdentifier(fields);

		if (rows.affectedRows == 1) {
			params.success = true;
			params.message = "Документ сохранен успешно";
			params.messageType = "primary";
		}
		else {
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


// router.post("/ids", function (req, res) {
//     var cleanIdsSource = req.body.clean ? req.body.clean.split(",") : [];
//     var errorIdsSource = req.body.error ? req.body.error.split(",") : [];

//     displayDocsByIds(req, res, cleanIdsSource, errorIdsSource);
// })


// router.get("/ids", function (req, res) {
//     var url_parts = url.parse(req.url, true);
//     var cleanIdsSource = url_parts.query.clean ? url_parts.query.clean.split(",") : [];
//     var errorIdsSource = url_parts.query.error ? url_parts.query.error.split(",") : [];

//     displayDocsByIds(req, res, cleanIdsSource, errorIdsSource);
// })

// function displayDocsByIds(req, res, cleanIdsSource, errorIdsSource) {
//     var unitedIds = [];
//     cleanIdsSource.forEach(function (recordId) {
//         unitedIds.push({type: "clean", id: recordId})
//     })
//     errorIdsSource.forEach(function (recordId) {
//         unitedIds.push({type: "error", id: recordId})
//     })

//     var cleanIdsParam = [];
//     var errorIdsParam = [];
//     paginate.slice(req)(unitedIds).forEach(function (docObject) {

//         if (docObject.type == "clean") {
//             cleanIdsParam.push(docObject.id);
//         }
//         if (docObject.type == "error") {
//             errorIdsParam.push(docObject.id);
//         }
//     })

//     promise.all([
//             cleanIdsParam.length ? model.getDocsClean({doc_id: cleanIdsParam}) : [],
//             errorIdsParam.length ? model.getDocs({doc_id: errorIdsParam}) : []
//         ]
//     ).then(function (result) {
//         var userModule = new UserModule();
//         userModule.setId(req.user.id);

//         var cleanDocs = result[0];
//         var errorDocs = result[1];

//         var renderParams = {
//             docs: cleanDocs.concat(errorDocs),
//             pages: paginate.getPages(req, res)(unitedIds.length),
//             user: req.user,
//             showIds: false,
//             postPage: true,
//             cleanIdsSource: cleanIdsSource,
//             errorIdsSource: errorIdsSource
//         }

//         if (url.parse(req.url, true)['query']['hide'] == "true") {
//             renderParams.layout = false;
//         }

//         res.render('docs/list/all', renderParams);
//     })
// }

// info
// router.get('/:id/:action?', function (req, res) {
//     var params = {};
//     var render = req.params.action == 'edit' ? 'docs/edit' : 'docs/info';
//     var print = req.params.action == 'print';

//     params.doc_id = req.params.id;
//     // params.active_only = true;

//     promise.all([
//         model.getDocs(params),
//         model.getDocControllers({doc_id: req.params.id, active_only: true}),
//         model.getDocAssigners({doc_id: req.params.id, active_only: true}),
//     ]).then(function (result) {
//         // var doc = populateStatus(result[0][0], req.user.id);
//         var doc = result[0][0];

//         if (typeof doc == "undefined") {
//             res.sendStatus(403);
//             return;
//         }
//         var controllers = result[1];
//         var assigners = result[2];

//         var params = {
//             doc: doc,
//             controllers: controllers,
//             assigners: assigners,
//             user: req.user,
//             can_edit_doc: user.can(req.user.admin, "edit_doc"),
//             can_remove_doc: canRemoveDoc(doc, req),
//             can_complete_doc: canCompleteDoc(doc, assigners, req),
//             can_edit_controllers: canEditControl(doc, req),
//             can_edit_assigners: canEditAssign(doc, req),
//             can_remove_own_control: canRemoveControl(doc, controllers, req),
//             can_add_files: canEditFiles(doc, req)
//         }

//         if (print) {
//             params.print = true;
//             params.layout = false;
//         }

//         res.render(render, params);
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

module.exports = router;