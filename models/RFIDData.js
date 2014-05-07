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
	            datetime: Date(rfid.datetime),
	            md5hash: data.datasummary.md5diggest
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

    this.getRFIDData = function(num, callback) {
        "use strict";      

        RFIDData.find().sort('date', -1).limit(num).toArray(function(err, items) {
            "use strict";

            if (err) return callback(err, null);

            console.log("Found " + items.length + " posts");

            callback(err, items);
        });
    }
}

module.exports.RFIDDataDAO = RFIDDataDAO;