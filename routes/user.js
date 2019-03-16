/**
 * Имя: роуты для урлов начинающихся с /users
 */

var express = require('express');
var router = express.Router();
var model = require('../models/db/db');
var user = require('../models/user/user');
var formidable = require('formidable');
var UserModule = require('../modules/user/user');

router.all('*', function (req, res, next) {
	if (!req.isAuthenticated()) {
		res.redirect('/');
		return;
	}
	next();
});

router.get('/:id/profile', function (req, res) {

	model.getUsers({
		user_id: req.params.id
	}).then(function (selectedUser) {
		var params = {}
		if (selectedUser[0].id) {
			params = {
				userInfo: selectedUser[0],
				user: req.user,
				canEdit: userCanEdit(selectedUser[0], req)
			}
		}
		else {
			params.error = "Пользователь не найден"
		}
		res.render('user/profile/view', params);
	})
});

router.get('/:id/profile/edit', function (req, res) {
	model.getUsers({
		user_id: req.params.id
	}).then(function (selectedUser) {
		if (!userCanEdit(selectedUser[0], req)) {
			res.sendStatus(403);
			return;
		}
		var params = {
			userInfo: selectedUser[0],
			user: req.user,
		}

		res.render('user/profile/edit', params);
	})
});

router.put('/:id/profile/edit', function (req, res) {
	var form = new formidable.IncomingForm();
	form.parse(req, function (err, fields, files) {

		if (!userCanEdit(fields, req)) {
			res.sendStatus(403);
		}

		var userM = new UserModule();
		userM.setId(fields.id);
		userM.setName(fields.fullname);
		userM.setDepartment(fields.department);
		userM.setPosition(fields.position);
		userM.setPhone(fields.phone);
		userM.setEmail(fields.email);
		userM.updateUser(function (result) {
			var params = {
				success: true,
				user: result
			}
			res.setHeader('Content-Type', 'application/json');
			res.end(JSON.stringify(params))
		});
	});
})

var userCanEdit = function (dbUser, req) {

	if (user.can(req.user.admin, "edit_any_profile")) {
		return true;
	}
	if (dbUser.id == req.user.id && user.can(req.user.admin, "edit_own_profile")) {
		return true;
	}
	return false;
}

module.exports = router;