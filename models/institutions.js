function InstitutionsDAO(db) {
    "use strict";

    /* If this constructor is called without the "new" operator, "this" points
     * to the global object. Log a warning and call it correctly. */
    if (false === (this instanceof InstitutionsDAO)) {
        console.log('Warning: InstitutionsDAO constructor called without "new" operator');
        return new InstitutionsDAO(db);
    }

    var institutions = db.collection("institutions");

    this.add = function (name, image_name, callback) {
        "use strict";
        
        var institution = {"name": name,
                "image_name": image_name,
                "date": new Date()}

        institutions.insert(institution, function (err, result) {
            "use strict";

            if (err) return callback(err);

            console.log("Inserted new institution");
            callback(err);
        });
    }

    this.getInstitutions = function(callback) {
        "use strict";

        institutions.find().sort('name', 1).toArray(function(err, items) {
            "use strict";

            if (err){ 
                console.log("Error getInstitutions, " + err);                
                return callback(err, null)
            };

            console.log("Found " + items.length + " institutions");            
            callback(err, items);
        });
    }

    this.getInstitutionById = function(id, callback) {
        "use strict";

        institutions.find({'_id':id}).sort('name', 1).toArray(function(err, item) {
            "use strict";

            if (err){ 
                console.log("Error getInstitutions, " + err);                
                return callback(err, null)
            };       
            callback(err, item);
        });
    }

        this.getInstitutionsIdNameHash= function(callback) {
        "use strict";

        institutions.find({}, {'_id':1, 'name':1}).sort('name', 1).toArray(function(err, items) {
            "use strict";

            if (err){ 
                console.log("Error getInstitutions, " + err);                
                return callback(err, null)
            };       

            var hash = {};
            for(var key in items){
                hash[items[key]._id] = items[key].name;
            }
            callback(err, hash);
        });
    }
    
}

module.exports.InstitutionsDAO = InstitutionsDAO;
