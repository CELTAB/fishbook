/****************************************************************************
**
** www.celtab.org.br
**
** Copyright (C) 2013
**                     Gustavo Valiati <gustavovaliati@gmail.com>
**                     Luis Valdes <luisvaldes88@gmail.com>
**                     Thiago R. M. Bitencourt <thiago.mbitencourt@gmail.com>
**
** This file is part of the FishBook project
**
** This program is free software; you can redistribute it and/or
** modify it under the terms of the GNU General Public License
** as published by the Free Software Foundation; version 2
** of the License.
**
** This program is distributed in the hope that it will be useful,
** but WITHOUT ANY WARRANTY; without even the implied warranty of
** MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
** GNU General Public License for more details.
**
** You should have received a copy of the GNU General Public License
** along with this program; if not, write to the Free Software
** Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
**
****************************************************************************/

var bcrypt = require('bcrypt-nodejs');

/* The UsersDAO must be constructed with a connected database object */
function UsersDAO(db) {
    "use strict";

    /* If this constructor is called without the "new" operator, "this" points
     * to the global object. Log a warning and call it correctly. */
    if (false === (this instanceof UsersDAO)) {
        console.log('Warning: UsersDAO constructor called without "new" operator');
        return new UsersDAO(db);
    }

    var users = db.collection("users");

    this.add = function(username, password, type, callback) {
        "use strict";

        // Generate password hash
        var salt = bcrypt.genSaltSync();
        var password_hash = bcrypt.hashSync(password, salt);

        // Create user document
        var user = {
            '_id': username, 
            'password': password_hash,
            'type' : type
        };

        users.insert(user, function (err, result) {
            "use strict";

            if(err) return callback(err);

            console.log("Inserted new user.");
            callback(err);
        });
    }

    this.update = function(username, name, email, photo, callback) {
        "use strict";

        var query = {
            '_id': username
        };

        var set = new Object;
        set['name'] = name;
        set['email'] = email;
        if(photo)
            set['photo'] = photo;

        var update = new Object;
        update['$set'] = set;

        users.update(query, update, function (err, updated) {
            "use strict";

            if(err) return callback(err);

            console.log("Updated the user.");
            callback(err);
        });
    }

    this.getUsers = function(callback){
        "use strict";

        users.find().sort("username", 1).toArray(function(err, items){
            if(err){
                console.log("Error getUsers, " + err);
                return callback(err, null);
            }
            console.log("Found " + items.length + " users");            
            callback(err, items);
        });
    }

    this.getUser = function(username, callback){
        "use strict";

        var query = new Object;
        query._id = username;

        users.findOne(query, function(err, doc){
            if(err){
                console.log("Error getUser, " + err);
                return callback(err, null);
            }
            console.log("User found.");            
            callback(err, doc);
        });
    }

    this.validateLogin = function(username, password, callback) {
        "use strict";

        // Callback to pass to MongoDB that validates a user document
        function validateUserDoc(err, user) {
            "use strict";

            if (err) return callback(err, null);

            if (user) {
                if (bcrypt.compareSync(password, user.password)) {
                    callback(null, user);
                }
                else {
                    var invalid_password_error = new Error("Invalid password");
                    // Set an extra field so we can distinguish this from a db error
                    invalid_password_error.invalid_password = true;
                    callback(invalid_password_error, null);
                }
            }
            else {
                var no_such_user_error = new Error("User: " + user + " does not exist");
                // Set an extra field so we can distinguish this from a db error
                no_such_user_error.no_such_user = true;
                callback(no_such_user_error, null);
            }
        }

        // TODO: hw2.3
        users.findOne({ '_id' : username }, validateUserDoc);
    }
}

module.exports.UsersDAO = UsersDAO;
