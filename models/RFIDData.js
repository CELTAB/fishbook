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


	var insert = function(data, callback){
		var rfidArray = data.datasummary.data;

		for(var key in rfidArray){
			var rfid = rfidArray[key];
		
			var rfidData = {
	            idcollectorpoint: rfid.idcollectorpoint,
	            idantena: rfid.idantena,
	            identificationcode: rfid.identificationcode,
				applicationcode: rfid.applicationcode,
	            datetime: Date(rfid.datetime)
			};

			RFIDData.insert(rfidData, function(err){
				if(err){
					callback(false);
					return console.log(err);
				}
				callback(true);
				return console.log('Insert successful: id = ' + rfidData._id);
			});
		}
	};

    this.getRFIDData = function(num, callback) {
        "use strict";

        RFIDData.find().sort('date', -1).limit(num).toArray(function(err, items) {
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
        	if(sortOrder)	
        		cursor.sort(sortBy, sortOrder);
        	else
        		cursor.sort(sortBy, 1);
        }

        if(limit)
        	cursor.limit(limit);
        

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