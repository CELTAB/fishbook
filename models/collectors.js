var ObjectID = require('mongodb').ObjectID;

function CollectorsDAO(db) {
    "use strict";

    /* If this constructor is called without the "new" operator, "this" points
     * to the global object. Log a warning and call it correctly. */
    if (false === (this instanceof CollectorsDAO)) {
        console.log('Warning: CollectorsDAO constructor called without "new" operator');
        return new CollectorsDAO(db);
    }

    var collectors = db.collection("collectors");

    this.add = function (collector, callback) {
        "use strict";        

        collectors.insert(collector, function (err, result) {
            "use strict";

            if (err) return callback(err);

            console.log("Inserted new collector");
            callback(err);
        });
    }

    this.save = function (collector, callback) {
        "use strict";        

        var newObject = {'$set': {
                                'name': collector.name, 
                                'institution_id': collector.institution_id,
                                'mac':collector.mac,
                                'description':collector.description }};

        collectors.update({'_id': ObjectID(collector._id) }, newObject, function (err, result) {
            "use strict";

            if (err) return callback(err);

            console.log("Updated new collector");
            callback(err);
        });
    }

    this.remove = function (collector, callback) {
        "use strict";        

        collectors.remove({'_id': ObjectID(collector._id) }, function (err, result) {
            "use strict";

            if (err) return callback(err);

            console.log("Removed new collector: " + ObjectID(collector._id));
            callback(err);
        });
    }

    this.updateStatus = function (mac, status, callback) {
        "use strict";    

        collectors.update({'mac':mac}, {'$set':{'status':status}}, function (err, number) {
            "use strict";
            if (err) return callback(err, number);
            callback(err, number);
        });
    }

    this.getCollectors = function(callback) {
        "use strict";

        collectors.find().sort('name', 1).toArray(function(err, items) {
            "use strict";

            if (err){ 
                console.log("Error getCollectors, " + err);                
                return callback(err, null)
            };

            //console.log("Found " + items.length + " collectors");            
            callback(err, items);
        });
    }

    this.getCollectorById = function(id, callback) {
        "use strict";

        collectors.findOne({'_id': ObjectID(id)}, function(err, item) {
            "use strict";

            if (err){ 
                console.log("Error getCollectors, " + err);                
                return callback(err, null)
            };
            
            callback(err, item);
        });
    }

    this.getCollectorsIdNameHash = function(callback) {
        "use strict";

        collectors.find().sort('name', 1).toArray(function(err, items) {
            "use strict";

            if (err){ 
                console.log("Error getCollectors, " + err);                
                return callback(err, null)
            };

            var hash = {};
            for(var key in items){
                hash[items[key]._id] = items[key].name;
            }
            
            callback(err, hash);
        });
    }

    this.getCollectorsMacNameHash = function(callback) {
        "use strict";

        collectors.find().sort('name', 1).toArray(function(err, items) {
            "use strict";

            if (err){ 
                console.log("Error getCollectors, " + err);                
                return callback(err, null)
            };

            var hash = {};
            for(var key in items){
                hash[items[key].mac] = {'name': items[key].name, 'institution_id': items[key].institution_id};
            }
            
            callback(err, hash);
        });
    }

    this.getCollectorByMac = function(macAddress, callback) {
        "use strict";

        collectors.findOne({'mac': macAddress}, function(err, doc) {
            "use strict";

            if (err){ 
                console.log("Error getCollectors, " + err);                
                return callback(err, null)
            };

            callback(err, doc);
        });
    }
}

module.exports.CollectorsDAO = CollectorsDAO;