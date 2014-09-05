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

function InstitutionsDAO(db) {
    "use strict";

    /* If this constructor is called without the "new" operator, "this" points
     * to the global object. Log a warning and call it correctly. */
    if (false === (this instanceof InstitutionsDAO)) {
        console.log('Warning: InstitutionsDAO constructor called without "new" operator');
        return new InstitutionsDAO(db);
    }

    var institutions = db.collection("institutions");

    this.add = function (institution_obj, callback) {
        "use strict";

        var institution = {
                name: institution_obj.name,
                image_name: institution_obj.image_name,
                lat: institution_obj.lat,
                lng: institution_obj.lng,
                date: new Date()
            };
        
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

        institutions.findOne({'_id': ObjectID(id)}, function(err, item) {
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

    this.save = function (institution, callback) {
        "use strict";        

        var newObject = {'$set': {
                                'name': institution.name,
                                'lat': institution.lat,
                                'lng': institution.lng
        }};

        if(institution.image_name)
            newObject['$set'].image_name = institution.image_name;

        institutions.update({'_id': ObjectID(institution._id) }, newObject, function (err, result) {
            "use strict";

            if (err) return callback(err);

            console.log("Updated new institution");
            callback(err);
        });
    }

    this.remove = function (institution, callback) {
        "use strict";        

        institutions.remove({'_id': ObjectID(institution._id) }, function (err, result) {
            "use strict";

            if (err) return callback(err);

            console.log("Removed new institution: " + ObjectID(institution._id));
            callback(err);
        });
    }
    
}

module.exports.InstitutionsDAO = InstitutionsDAO;
