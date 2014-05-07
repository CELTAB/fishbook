function InstitutionsDAO(db) {
    "use strict";

    /* If this constructor is called without the "new" operator, "this" points
     * to the global object. Log a warning and call it correctly. */
    if (false === (this instanceof InstitutionsDAO)) {
        console.log('Warning: InstitutionsDAO constructor called without "new" operator');
        return new InstitutionsDAO(db);
    }

    var institutions = db.collection("institutions");

    this.add = function (name, logo, callback) {
        "use strict";
        
        var institution = {"name": name,
                "logo": logo,
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

    
}

module.exports.InstitutionsDAO = InstitutionsDAO;
