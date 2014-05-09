module.exports = function(SocketIO, db){

    var collectorPoint = require('../models/CollectorPoint');
    var RFIDDataDAO = require('../models/RFIDData').RFIDDataDAO;

    var InstitutionsDAO = require('../models/institutions').InstitutionsDAO,
    	SpeciesDAO = require('../models/species').SpeciesDAO,
    	CollectorsDAO = require('../models/collectors').CollectorsDAO,
    	TaggedFishesDAO = require('../models/tagged_fishes').TaggedFishesDAO;

    var RFIDData_MongoDB = new RFIDDataDAO(db);
    var institutions = new InstitutionsDAO(db);
    var species = new SpeciesDAO(db);
    var collectors = new CollectorsDAO(db);
    var tagged_fishes = new TaggedFishesDAO(db);

	var net = require('net');
	var server = net.createServer();

	var events = require('events');
	var serverEmitter = new events.EventEmitter();

	var jade = require('jade');

	var buildMessage = function(message){
		var size = message.length;
		var newMessage = String('00000000' + size).slice(size.toString().length);
		var newMessage = newMessage.concat(message);
		return newMessage;
	}

	server.on('connection', function(socket) {
		var address = socket.address();
    console.log("New connection from " + address.address + ":" + address.port);

		socket.on('end', function() {
			console.log('Client Disconnected');
		});
	
		socket.on('data', function(data) {

			// Convert message to JSON
			var message = "";
			try {
			 //  console.log("Raw data: "+data.toString());
				var buffer = [];
				buffer = data.slice(0, 8);
				var size = parseInt(buffer);
				console.log("Size of packet = " + size + " /  Size of data = " + data.length);

				var jsonString = data.slice(8, data.length).toString();
			  message = JSON.parse(jsonString);
			} catch (e) {
			  console.log("Error on JSON.parse: " + e);
			  console.log("Message : " + data.toString());
			  return;
			}


			// Handshake ONLY
			// Client answers the SYN with an ACK
			if(message.type == "SYN"){
				console.log("SYN : " + JSON.stringify(message));
				var clientInfo = message.data;

				var handshake = {type:"ACK-SYN", data: {}, datetime: (new Date()).toISOString()};

				try{				
					var ack_syn_raw	= JSON.stringify(handshake);
					var ack_syn = buildMessage(ack_syn_raw);
					console.log("ACK-SYN: " + ack_syn);
					socket.write(ack_syn);
				}catch(e){
					console.log("ACK-SYN error: " + e);
				}
			}

			if(message.type == "ACK"){
				console.log("ACK : " + JSON.stringify(message));
			}

			// DATA ONLY
			// When the client sends data
			if(message.type == "DATA"){
				console.log(JSON.stringify(message.data));
				RFIDData_MongoDB.insert(message.data, function(success){
					if(success){
						var md5hash = message.data.datasummary.md5diggest;
						console.log("Hash inserted: " + md5hash);

						var ack_data = {
										type: 'ACK-DATA',
										data: {
											md5diggest: [md5hash]
										},
										datetime: (new Date).toISOString()
									   };
						console.log("Sending ACK-DATA: " + JSON.stringify(ack_data));
						socket.write(buildMessage(JSON.stringify(ack_data)));


				        collectors.getCollectorsIdNameHash(function(err, collectors_hash){
				            species.getSpeciesIdNameHash(function(err, species_hash){
				                institutions.getInstitutionsIdNameHash(function(err, institutions_hash){

					                // RFID pit_tag -> Species[institution_id, species_id]
					                // RFID collector_id -> Collectors[collector_name]

									var rfidArray = message.data.datasummary.data;
									for(var key in rfidArray){
										var rfid = rfidArray[key];

										tagged_fishes.getTaggedFishesByPitTagSpeciesIdInstituionIdHash(rfid.identificationcode, function(err, rfidtag_hash){
				                            
											var rfiddata = new Object;
											console.log("rfidtag_hash" + JSON.stringify(rfidtag_hash));

				                            rfid.institution_name = institutions_hash[rfidtag_hash.institution_id];
				                            rfid.species_name = species_hash[rfidtag_hash.species_id];
				                            rfid.collector_name = species_hash[rfidArray[key].collector_id];

				                            console.log(JSON.stringify(rfid));

											jade.renderFile('./views/fishrow.jade', {rfiddata: rfid}, function (err, html) {
											  if (!err) 
												serverEmitter.emit('rfiddata', { htmlRow: html} );	
											  else throw err
											});
							            });														
									}
								});
				            });
				        });
				                    


					}
				});
			}
		});
	});

	serverEmitter.on('rfiddata', function(data){
		console.log('serverEmitter.on: '+data);
	});


	var startServer = function(){
		server.listen(8124, function() { //'listening' listener
		  console.log('server bound');
		});	
	}
	return {
		start: startServer,
		ServerEmitter: serverEmitter
	}
}

