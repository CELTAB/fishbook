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
}

module.exports.SpeciesDAO = SpeciesDAO;