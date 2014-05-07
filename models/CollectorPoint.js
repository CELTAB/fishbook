module.exports = function(db){

	var CollectorPoint = db.collection('collectors');

	var insertCallback = function(err){
		if(err){
			return console.log(err);
		}
		return console.log('Insert successful.');
	};

	var insert = function(collector){
		var newCollector = {
            name: collector.name,
            macAddress: collector.macaddress,
            description: "New collector point"
		};
		CollectorPoint.insert(insertCallback);
		return newCollector;
	};

	var checkIfExist = function(macAddress, callback){
		CollectorPoint.findOne({macAddress: macAddress}, function(err, doc){
			callback(doc!=null);
		});
	}

	return {
		insert: insert,
		checkIfExist: checkIfExist,
		CollectorPoint: CollectorPoint
	}
}