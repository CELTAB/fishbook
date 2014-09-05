/****************************************************************************
**
** www.celtab.org.br
**
** Copyright (C) 2013
**                     Gustavo Valiati <gustavovaliati@gmail.com>
**                     Luis Valdes <luisvaldes88@gmail.com>
**                     Thiago R. M. Bitencourt <thiago.mbitencourt@gmail.com>
**
** This file is part of the FishBook project
**
** This program is free software; you can redistribute it and/or
** modify it under the terms of the GNU General Public License
** as published by the Free Software Foundation; version 2
** of the License.
**
** This program is distributed in the hope that it will be useful,
** but WITHOUT ANY WARRANTY; without even the implied warranty of
** MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
** GNU General Public License for more details.
**
** You should have received a copy of the GNU General Public License
** along with this program; if not, write to the Free Software
** Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
**
****************************************************************************/

var ObjectID = require('mongodb').ObjectID;

function TaggedFishesDAO(db) {
    "use strict";

    /* If this constructor is called without the "new" operator, "this" points
     * to the global object. Log a warning and call it correctly. */
    if (false === (this instanceof TaggedFishesDAO)) {
        console.log('Warning: CapturedFishesDAO constructor called without "new" operator');
        return new TaggedFishesDAO(db);
    }

    var tagged_fishes = db.collection("tagged_fishes");

    this.add = function (tagged_fish, callback) {
        "use strict";

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

            console.log('Searching for pit_tag: ' + pit_tag);

            var hash = {};
            if(item){ 
            console.log('Find One: ' + pit_tag + ' - ' + JSON.stringify(item));

            console.log("PIT_TAG: " + JSON.stringify(item));

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

    this.getTaggedFishesById = function(id, callback){
        "use strict";

        tagged_fishes.findOne({'_id':ObjectID(id)},function(err, item){
            "use strict";

            if (err){ 
                console.log("Error getTaggedFishesById, " + err);                
                return callback(err, null)
            };

            callback(err, item);
        });
    }

    this.getTaggedFishesByPitTag = function(pit_tag, callback){
        "use strict";

        tagged_fishes.findOne({'pit_tag': parseInt(pit_tag)}, function(err, item) {

            console.log('Searching for pit_tag: ' + pit_tag);

            var hash = {};
            if(item){ 
            console.log('Find One: ' + pit_tag + ' - ' + JSON.stringify(item));

            console.log("PIT_TAG: " + JSON.stringify(item));

            hash[item.pit_tag] = {'species_id': item.species_id, 'institution_id': item.institution_id};

            }
            callback(err, item);
        });
    }

    this.save = function (tagged_fish_obj, callback) {
        "use strict";     

        var newObject = {'$set': {
                            'species_id' : tagged_fish_obj.species_id,
                            'pit_tag' : tagged_fish_obj.pit_tag,
                            'capture_local' : tagged_fish_obj.capture_local,
                            'release_local' : tagged_fish_obj.release_local,
                            'total_length' : tagged_fish_obj.total_length,
                            'default_length' : tagged_fish_obj.default_length,
                            'weight' : tagged_fish_obj.weight,
                            'sex' : tagged_fish_obj.sex,
                            'observation' : tagged_fish_obj.observation,
                            'institution_id' : tagged_fish_obj.institution_id,
                            'release_date' : tagged_fish_obj.release_date,
                            'capture_date' : tagged_fish_obj.capture_date

        }};

        tagged_fishes.update({'_id': ObjectID(tagged_fish_obj._id) }, newObject, function (err, result) {
            "use strict";

            if (err) return callback(err);

            console.log("Updated new tagged_fish_obj");
            callback(err);
        });
    }

    this.remove = function (tagged_fish_obj, callback) {
        "use strict";        

        tagged_fishes.remove({'_id': ObjectID(tagged_fish_obj._id) }, function (err, result) {
            "use strict";

            if (err) return callback(err);

            console.log("Removed new tagged_fish_obj: " + ObjectID(tagged_fish_obj._id));
            callback(err);
        });
    }
    
}

module.exports.TaggedFishesDAO = TaggedFishesDAO;
