function InstitutionsDAO(db) {
    "use strict";

    /* If this constructor is called without the "new" operator, "this" points
     * to the global object. Log a warning and call it correctly. */
    if (false === (this instanceof InstitutionsDAO)) {
        console.log('Warning: InstitutionsDAO constructor called without "new" operator');
        return new InstitutionsDAO(db);
    }

    var institutions = db.collection("institutions");

    this.insertEntry = function (name, lat, lon, logo, callback) {
        "use strict";
        
        var institution = {"name": name,
                "place": {'lat':lat, 
                        'lon':lon},
                "logo": logo,
                "date": new Date()}

        institutions.insert(institution, function (err, result) {
            "use strict";

            if (err) return callback(err, null);

            console.log("Inserted new institution");
            callback(err, permalink);
        });
    }

    this.getInstitutions = function(num, callback) {
        "use strict";

        institutions.find().sort('name', 1).limit(num).toArray(function(err, items) {
            "use strict";

            if (err) return callback(err, null);

            console.log("Found " + items.length + " posts");

            callback(err, items);
        });
    }

    
}

module.exports.InstitutionsDAO = InstitutionsDAO;
