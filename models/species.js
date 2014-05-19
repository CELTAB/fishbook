var ObjectID = require('mongodb').ObjectID;

function SpeciesDAO(db){
	"use strict";

	/* If this constructor is called without the "new" operator, "this" points
     * to the global object. Log a warning and call it correctly. */
    if (false === (this instanceof SpeciesDAO)) {
        console.log('Warning: SpeciesDAO constructor called without "new" operator');
        return new SpeciesDAO(db);
    }

    var species = db.collection("species");

    this.add = function(name, image, callback){
    	"use strict";

    	var specie = {
    		"name" : name,
    		"image" : image
    	}

    	species.insert(specie, function(err, result){
    		"use strict";

    		if(err) return callback(err);

    		console.log("Insert new specie");
    		callback(err);
    	});
    }

    this.getSpecies = function(callback){
    	"use strict";

    	species.find().sort('name',1).toArray(function(err, items){
    		"use strict";

    		if (err){ 
                console.log("Error getSpecies, " + err);                
                return callback(err, null)
            };

            console.log("Found " + items.length + " getSpecies");            
            callback(err, items);
    	});
    }

    this.getSpecieById = function(id, callback){
        "use strict";

        species.findOne({'_id':ObjectID(id)},function(err, item){
            "use strict";

            if (err){ 
                console.log("Error getSpecies, " + err);                
                return callback(err, null)
            };

            callback(err, item);
        });
    }

    this.getSpeciesIdNameHash = function(callback){
        "use strict";

        species.find({}, {'_id':1, 'name':1}).sort('name',1).toArray(function(err, items){
            "use strict";

            if (err){ 
                console.log("Error getSpecies, " + err);                
                return callback(err, null)
            };

            var hash = {};
            for(var key in items){
                hash[items[key]._id] = items[key].name;
            }

            callback(err, hash);
        });
    }

    this.save = function (species_obj, callback) {
        "use strict";        

        var newObject = {'$set': {
                                'name': species_obj.name
        }};

        if(species_obj.image_name)
            newObject['$set'].image_name = species_obj.image_name;

        species.update({'_id': ObjectID(species_obj._id) }, newObject, function (err, result) {
            "use strict";

            if (err) return callback(err);

            console.log("Updated new species_obj");
            callback(err);
        });
    }

    this.remove = function (species_obj, callback) {
        "use strict";        

        species.remove({'_id': ObjectID(species_obj._id) }, function (err, result) {
            "use strict";

            if (err) return callback(err);

            console.log("Removed new species_obj: " + ObjectID(species_obj._id));
            callback(err);
        });
    }

}

module.exports.SpeciesDAO = SpeciesDAO;