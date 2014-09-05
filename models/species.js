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