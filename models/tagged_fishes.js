function TaggedFishesDAO(db) {
    "use strict";

    /* If this constructor is called without the "new" operator, "this" points
     * to the global object. Log a warning and call it correctly. */
    if (false === (this instanceof TaggedFishesDAO)) {
        console.log('Warning: CapturedFishesDAO constructor called without "new" operator');
        return new TaggedFishesDAO(db);
    }

    var tagged_fishes = db.collection("tagged_fishes");

    this.add = function (species_id, pit_tag, capture_local,
                         release_local, total_length, default_length,
                         weight, sex, observation, institution_id, callback) {
        "use strict";
        
        var tagged_fish = {
            "species_id" : species_id,
            "pit_tag" : pit_tag,
            "capture_local": capture_local,
            "release_local": release_local,
            "total_length": total_length,
            "default_length": default_length,
            "weight" : weight,
            "sex": sex,
            "observation": observation,
            "institution_id": institution_id
        }

        tagged_fishes.insert(tagged_fish, function (err, result) {
            "use strict";

            if (err) return callback(err);

            console.log("Inserted new tagged_fish");
            callback(err);
        });
    }

    this.getTaggedFishes = function(callback) {
        "use strict";

        tagged_fishes.find().sort('specie', 1).toArray(function(err, items) {
            "use strict";

            if (err){ 
                console.log("Error getTaggedFishes, " + err);                
                return callback(err, null)
            };

            console.log("Found " + items.length + " tagged_fish");            
            callback(err, items);
        });
    }

    
}

module.exports.TaggedFishesDAO = TaggedFishesDAO;
