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
            "pit_tag" : parseInt(pit_tag),
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

        tagged_fishes.find().sort('species_id', 1).toArray(function(err, items) {
            "use strict";

            if (err){ 
                console.log("Error getTaggedFishes, " + err);                
                return callback(err, null)
            };

            console.log("Found " + items.length + " tagged_fish");            
            callback(err, items);
        });
    }

    
    this.getTaggedFishesWithNames = function(callback) {
        "use strict";

        tagged_fishes.find().sort('species_id', 1).toArray(function(err, items) {
            "use strict";

            if (err){ 
                console.log("Error getTaggedFishes, " + err);                
                return callback(err, null)
            };

            callback(err, items);
        });
    }

    this.getTaggedFishesByPitTagSpeciesIdInstutionIdHash = function(pit_tag, callback) {
        "use strict";

        tagged_fishes.findOne({'pit_tag': parseInt(pit_tag)}, function(err, item) {

            var hash = {};
            if(item){ 
           // console.log('Find One: ' + pit_tag + ' - ' + JSON.stringify(item));

//            console.log("PIT_TAG: " + JSON.stringify(item));

            hash[item.pit_tag] = {'species_id': item.species_id, 'institution_id': item.institution_id};

            }
            callback(err, hash);
        });

    }

        this.getTaggedFishesByPitTagHash = function(callback) {
        "use strict";

        tagged_fishes.find().toArray(function(err, items) {

            var hash = {};
            for(var key in items){
                hash[items[key].pit_tag] = {'species_id': items[key].species_id, 'institution_id': items[key].institution_id};
            }
            
            callback(err, hash);
        });

    }
    
}

module.exports.TaggedFishesDAO = TaggedFishesDAO;
