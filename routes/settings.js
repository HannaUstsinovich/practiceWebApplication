/**
 * Имя: роуты для урлов начинающихся с /settings
 */

var express = require('express');
var router = express.Router();
var package = require('../package.json');
var user = require('../models/user/user');
var formidable = require('formidable');
var UserModule = require('../modules/user/user');
var model = require('../models/db/db');


router.all('*', function (req, res, next) {
	if (!req.isAuthenticated()) {
		res.sendStatus(403);
		return;
	}
	next();
});

router.get('/', function (req, res) {
	res.render('settings/home', {
		user: req.user, // get the user out of session and pass to template
		canAddUsers: user.can(req.user.admin, "add_users"),
		canEditUsers: user.can(req.user.admin, "edit_users"),
	});
});


router.get('/version', function (req, res) {
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify({ version: package.app_version }));
});


router.get('/user/add', function (req, res) {
	if (!user.can(req.user.admin, "add_users")) {
		res.sendStatus(403);
	}
	res.render('settings/add_user', {
		user: req.user // get the user out of session and pass to template
	})
});

router.post('/user/add', function (req, res) {
	if (!user.can(req.user.admin, "add_users")) {
		res.sendStatus(403);
	}

	var form = new formidable.IncomingForm();
	form.parse(req, function (err, fields, files) {

		var userM = new UserModule();

		userM.setName(fields.fullname);
		userM.setUsername(fields.username);
		userM.setDepartment(fields.new_department ? fields.new_department : fields.department);
		userM.setPosition(fields.position);
		userM.setPhone(fields.phone);
		userM.setAdmin(fields.admin);
		userM.setEmail(fields.email);
		userM.setPassword(fields.password);
		userM.saveUser(function (user) {
			userM.setId(user[0].id);
			var params = {
				success: true,
				result_message: "Пользователь успешно добавлен",
				user: user
			}
			res.setHeader('Content-Type', 'application/json');
			res.end(JSON.stringify(params));
		});
	})
});

router.get('/user/change_password', function (req, res) {
	res.render('settings/change_password', {
		user: req.user
	});
});

router.put('/user/:id?/change_password', function (req, res) {
	if (req.params.id) {
		if (req.params.id !== req.user.id && !user.can(req.user.admin, 'change_any_password')) {
			res.sendStatus(403);
			return;
		}
		var employeeId = req.params.id;
	}
	else {
		var employeeId = req.user.id
	}

	var form = new formidable.IncomingForm();

	form.multiples = true;

	form.parse(req, function (err, fields) {
		var userModule = new UserModule();
		userModule.setId(employeeId);
		userModule.setPassword(fields.password);
		userModule.updatePassword(function (result) {
			var params = {
				success: true,
				user: req.user
			}
			res.setHeader('Content-Type', 'application/json');
			res.end(JSON.stringify(params))
		})
	})
})

router.get('/user/change_password', function (req, res) {
	res.render('settings/change_password', {
		user: req.user
	});
});

router.get('/user/:id/change_password/', function (req, res) {
	if (!user.can(req.user.admin, "change_any_password")) {
		res.sendStatus(403);
		return;
	}

	model.getUsers({ user_id: req.params.id }).then(function (row) {
		res.render('settings/change_password', {
			user: req.user,
			employee: row[0]
		}
		)
	});
});

router.get('/users/list', function (req, res) {
	if (!user.can(req.user.admin, 'edit_users')) {
		res.sendStatus(403);
		return;
	}

	model.getUsers({}).then(function (users) {
		res.render('settings/users_list', {
			users: users,
			user: req.user
		})
	})
});

// router.get('/user/:id', function (req, res) {
//     if (!user.can(req.user.admin, 'edit_user')) {
//         res.sendStatus(403);
//         return;
//     }

//     model.getUsers({user_id: req.params.id}).then(function (row) {
//         res.render('settings/users/user', {
//             user: req.user,
//             row: row
//         })
//     });
// });

// router.get('/users/:id/activity', function (req, res) {
//     if (!user.can(req.user.admin, 'edit_users')) {
//         res.sendStatus(403);
//         return;
//     }

//     model.getActivity({user_id: req.params.id}).then(function (activities) {
//         model.getUsers({user_id: req.params.id}).then(function (row) {
//             res.render('settings/users/activity', {
//                 user: req.user,
//                 activities: activities,
//                 username: row.name
//             })
//         })

//     });
// });

// router.get('/users/:id/block', function (req, res) {
//     if (!user.can(req.user.admin, 'edit_users')) {
//         res.sendStatus(403);
//         return;
//     }

//     model.blockUser({user_id: req.params.id}).then(function () {
//         res.redirect('/settings/users/list');
//     });
// });

// router.get('/users/:id/unblock', function (req, res) {
//     if (!user.can(req.user.admin, 'edit_users')) {
//         res.sendStatus(403);
//         return;
//     }

//     model.unblockUser({user_id: req.params.id}).then(function () {
//         res.redirect('/settings/users/list');
//     });
// });

// router.post('/user/change_password/:id?', function (req, res) {
//     // var password = req.body.password;
//     if (req.params.id) {
//         if (req.params.id !== req.user.id && !user.can(req.user.admin, 'change_any_password')) {
//             res.sendStatus(403);
//             return;
//         }
//         var recipientId = req.params.id;
//     }
//     else {
//         var recipientId = req.user.id
//     }

//     var userModule = new UserModule();
//     userModule.setId(recipientId);
//     userModule.setPassword(req.body.password);
//     userModule.updatePassword(function (result) {
//         res.render('settings/change_password', {
//             success: true,
//             result_message: "Пароль изменен",
//             user: req.user
//         })
//     })
// });

module.exports = router;