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

/* The RFIDDataDAO must be constructed with a connected database object */
function RFIDDataDAO(db) {
    "use strict";

    /* If this constructor is called without the "new" operator, "this" points
     * to the global object. Log a warning and call it correctly. */
    if (false === (this instanceof RFIDDataDAO)) {
        console.log('Warning: RFIDDataDAO constructor called without "new" operator');
        return new RFIDDataDAO(db);
    }

    var RFIDData = db.collection('rfiddata');

	this.insert = function(data, callback){
		var rfidArray = data.datasummary.data;

		for(var key in rfidArray){
			var rfid = rfidArray[key];
		
			var rfidData = {
	            idcollectorpoint: rfid.idcollectorpoint,
	            idantena: rfid.idantena,
	            identificationcode: rfid.identificationcode,
				applicationcode: rfid.applicationcode,
	            datetime: new Date(rfid.datetime),
	            md5hash: data.datasummary.md5diggest,
                macaddress: data.macaddress
			};

			RFIDData.insert(rfidData, function(err){
				if(err){
					callback(false);
					return console.log(err);
				}
				callback(true);
				return console.log('Insert successful: ObjectId = ' + rfidData._id);
			});
		}
	};

    this.insertImportedData = function(summaryArray, callback){

        for(var summary in summaryArray){

            var rfidArray = summaryArray[summary].datasummary.data;

            for(var key in rfidArray){
                var rfid = rfidArray[key];
            
                var rfidData = {
                    idcollectorpoint: rfid.idcollectorpoint,
                    idantena: rfid.idantena,
                    identificationcode: rfid.identificationcode,
                    applicationcode: rfid.applicationcode,
                    datetime: new Date(rfid.datetime),
                    md5hash: summaryArray[summary].datasummary.md5diggest
                };

                RFIDData.insert(rfidData, function(err){
                    if(err){
                        callback(false);
                        return console.log(err);
                    }
                    callback(true);
                    return console.log('Insert successful');
                });
            }
        }

    }

    this.getRFIDData = function(num, callback) {
        "use strict";      

        RFIDData.find().sort('datetime', -1).limit(num).toArray(function(err, items) {
            "use strict";

            if (err) return callback(err, null);

            console.log("Found " + items.length + " RFIDs");

            callback(err, items);
        });
    }

    this.findRFIDData = function(query, sortBy, sortOrder, limit, callback) {
        "use strict";

        console.log("Query arrived: "+ JSON.stringify(query));

        var cursor =  RFIDData.find(query);

        if(sortBy){
            console.log(sortBy);
            if(sortOrder){  
                cursor.sort(sortBy, sortOrder);
                console.log(sortOrder);
            }
            else
                cursor.sort(sortBy, 1);
        }

        if(limit){
            cursor.limit(limit);
            console.log(limit);
        }
        

        cursor.toArray(function(err, items) {
            "use strict";

            if (err) return callback(err, null);

            console.log("Found " + items.length + " RFIDs");
            console.log(JSON.stringify(items));

            callback(err, items);
        });
    }
}

module.exports.RFIDDataDAO = RFIDDataDAO;