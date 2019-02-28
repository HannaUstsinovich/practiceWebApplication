/**
 * Имя: модуль юзеров
 * Назначение: создание, редактирование, удаление пользователей
 */
var model = require('../../models/db/db');
var bcrypt = require('bcrypt-nodejs');
var fs = require('fs');
var promise = require("bluebird");


var user = function () {
    var id,
        fullname,
        username,
        department,
        position,
        phone,
        email,
        password;

    return {
        saveUser: function (callback) {
            model.createUser({
                fullname: this.fullname,
                username: this.username,
                position: this.position,
                department: this.department,
                phone: this.phone,
                email: this.email,
                password: this.password,
                admin: this.admin
            }).then(function (result) {
                if (callback)
                    callback(result)
            });
        },

        // updateUser: function (callback) {
        //     if (!this.id) {
        //         callback();
        //         return;
        //     }

        //     var user = {
        //         id: this.id,
        //         fullname: this.fullname,
        //         position: this.position,
        //         department: this.department,
        //         phone: this.phone,
        //         email: this.email
        //     }

        //     model.updateUser(user).then(function (result) {
        //         if (callback)
        //             callback(result);
        //     });
        // },

        // updatePassword: function (callback) {
        //     model.updateUserPassword(this.id, this.password).then(
        //         function (result) {
        //             callback({success: result.affectedRows})
        //         }
        //     )
        // },

        setId: function (id) {
            this.id = id;
        },

        setUsername: function (username) {
            this.username = username;
        },

        setName: function (fullname) {
            this.fullname = fullname;
        },

        setDepartment: function (department) {
            this.department = department;
        },

        setPosition: function (position) {
            this.position = position;
        },

        setPhone: function (phone) {
            this.phone = phone;
        },

        setAdmin: function (admin) {

            this.admin = admin || 0;
        },

        setEmail: function (email) {
            this.email = email;
        },

        setPassword: function (password) {
            this.password = bcrypt.hashSync(password, null, null);
        },

        // filterDocsError: function (errorDocIds, callback) {
        //     var result = [];
        //     promise.all([
        //         model.filterDocsError(this.id, errorDocIds),
        //         model.filterDocsControl(this.id, errorDocIds),
        //         model.filterDocsAssign(this.id, errorDocIds),
        //     ]).then(function (rawResult) {
        //         var result = {};
        //         rawResult.forEach(function (tableRes) {
        //             if (typeof tableRes !== 'undefined' && tableRes.length) {
        //                 tableRes.forEach(function (row) {
        //                     if (!result[row.doc_id]) {
        //                         result[row.doc_id] = 0;
        //                     }

        //                     result[row.doc_id] += row.count;
        //                 })
        //             }
        //         })

        //         callback(result);
        //     })
        // },
    }
}

module.exports = user;

