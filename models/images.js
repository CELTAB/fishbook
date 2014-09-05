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

function ImagesDAO(db){
	"use strict";

	/* If this constructor is called without the "new" operator, "this" points
     * to the global object. Log a warning and call it correctly. */
    if (false === (this instanceof ImagesDAO)) {
        console.log('Warning: ImageDAO constructor called without "new" operator');
        return new ImagesDAO(db);
    }

    var images = db.collection("images");

    this.add = function(file, callback){
    	"use strict";

    	var image = {
    		"name" : file.name,
    		"image_path" : file.image,
            "type": file.type,
            "size": file.size,
            "insert_date": file.insert_date
    	}

    	images.insert(image, function(err, result){
    		"use strict";

    		if(err) return callback(err);

    		console.log("Insert new image");
    		callback(err);
    	});
    }

    this.getImages = function(callback){
    	"use strict";

    	images.find().sort('name',1).toArray(function(err, items){
    		"use strict";

    		if (err){ 
                return callback(err, null)
            };

            callback(err, items);
    	});
    }

    this.getImage = function(name, callback){
        "use strict";

        images.find().sort('name',1).toArray(function(err, items){
            "use strict";

            if (err){ 
                return callback(err, null)
            };

            callback(err, items);
        });
    }
}

module.exports.ImagesDAO = ImagesDAO;