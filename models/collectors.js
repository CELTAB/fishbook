function CollectorsDAO(db) {
    "use strict";

    /* If this constructor is called without the "new" operator, "this" points
     * to the global object. Log a warning and call it correctly. */
    if (false === (this instanceof CollectorsDAO)) {
        console.log('Warning: CollectorsDAO constructor called without "new" operator');
        return new CollectorsDAO(db);
    }

    var collectors = db.collection("collectors");

    this.add = function (_id, name, mac, description, callback) {
        "use strict";
        
        var collector = {
                "_id": _id,
                "name": name,
                "mac" : mac,
                "description" : description
            }

        collectors.insert(collector, function (err, result) {
            "use strict";

            if (err) return callback(err);

            console.log("Inserted new collector");
            callback(err);
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

            console.log("Found " + items.length + " collectors");            
            callback(err, items);
        });
    }

    
}

module.exports.CollectorsDAO = CollectorsDAO;