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
			console.log('Collector MAC from Socket: ' + socket.CollectorMAC);
			collectors.updateStatus(socket.CollectorMAC, 'Offline', function(err, number){

			});

			collectors.getCollectorByMac(socket.CollectorMAC, function(err, doc){
				if(err) return err;

				if(doc){
					var collectorStatus = {
						name: doc.name,
						mac: doc.mac,
						status: 'Offline'
					};
					serverEmitter.emit('collectors_status', collectorStatus);	
				}	
			});			
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
				console.log('clientInfo: '+ JSON.stringify(clientInfo));

				// SYN : {"data":{"id":8250,"macaddress":"B8:27:EB:21:28:B7","name":"Canal de Iniciação"},"datetime":"2014-05-14T14:06:58","type":"SYN"}
				collectors.getCollectorByMac(clientInfo.macaddress, function(err, doc){
					if(err) return err;

					socket.CollectorMAC = clientInfo.macaddress;

					if(doc){
						console.log('Collector MAC from Socket: ' + socket.CollectorMAC);
						doc.status = 'Online';
						collectors.updateStatus(clientInfo.macaddress, 'Online', function(err, number){

						});
						var collectorStatus = {
							name: doc.name,
							mac: doc.mac,
							status: doc.status
						};
						serverEmitter.emit('collectors_status', collectorStatus);	
					}else{
						console.log('New Collector MAC from Socket: ' + socket.CollectorMAC);
				        var collector = {
				            institution_id: '',
				            name: 'New Collector: ' + clientInfo.macaddress,
				            mac: clientInfo.macaddress,
				            description : 'Created automaticlly on date: ' + (new Date).toISOString(),
							status: 'Online'
				        };
						collectors.add(collector, function(err) {

						});
						var collectorStatus = {
							name: 'New Collector: ' + clientInfo.macaddress,
							mac: clientInfo.macaddress,
							status: 'Online'
						};
						serverEmitter.emit('collectors_status', collectorStatus);	
					}
				});

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
						var collectorMac = message.data.macaddress;
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
						try{
							socket.write(buildMessage(JSON.stringify(ack_data)));
						}catch(e){
							
						}


				        collectors.getCollectorsMacNameHash(function(err, collectors_hash){
				            species.getSpeciesIdNameHash(function(err, species_hash){
				                institutions.getInstitutionsIdNameHash(function(err, institutions_hash){

					                // RFID pit_tag -> Species[institution_id, species_id]
					                // RFID collector_id -> Collectors[collector_name]

									var rfidArray = message.data.datasummary.data;
									for(var key in rfidArray){
										var rfid = rfidArray[key];

										tagged_fishes.getTaggedFishesByPitTagSpeciesIdInstutionIdHash(rfid.identificationcode, function(err, rfidtag_hash){
				                            
											var rfiddata = new Object;
											console.log("rfidtag_hash: " + JSON.stringify(rfidtag_hash));
											console.log("institutions_hash: " + JSON.stringify(institutions_hash));
											console.log("species_hash: " + JSON.stringify(species_hash));
											console.log("collectors_hash: " + JSON.stringify(collectors_hash));

											var tagId = rfid.identificationcode;
											var tagInfo = rfidtag_hash[tagId];
											console.log('tagId: '+ JSON.stringify(tagId) + ', tagInfo: ' + JSON.stringify(tagInfo));

											if(tagInfo){
				                            	rfid.institution_name = institutions_hash[tagInfo.institution_id];
				                            	rfid.species_name = species_hash[tagInfo.species_id];
				                            	rfid.collector_name = collectors_hash[collectorMac].name;
				                        	}else{
												rfid.institution_name = 'Unknown';
				                            	rfid.species_name = 'Unknown';
				                            	rfid.collector_name = 'Unknown';
				                        	}

				                            console.log(JSON.stringify(rfid));

											jade.renderFile('./views/fishrow.jade', {rfiddata: rfid}, function (err, html) {
											  if (!err) 
												serverEmitter.emit('rfiddata', { htmlRow: html, mac: collectorMac} );	
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

	var summaryUpdate = function(){
		var summary = {
			collectors: [{
				name: '',
				lat: 12,
				lon: 13,
				status: ''
			}],
			rfiddata: [{
				institution_name: '',
				species_name: '',
				collector_name: '',
				pit_tag: 12346,
				datetime: ''
			}]
		};
		serverEmitter.emit('summary', summary );	
	}

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

