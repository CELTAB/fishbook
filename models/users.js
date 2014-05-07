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
