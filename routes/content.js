var InstitutionsDAO = require('../models/institutions').InstitutionsDAO
  , sanitize = require('validator').sanitize, // Helper to sanitize form input
    RFIDDataDAO = require('../models/RFIDData').RFIDDataDAO,
    SpeciesDAO = require('../models/species').SpeciesDAO,
    CollectorsDAO = require('../models/collectors').CollectorsDAO,
    TaggedFishesDAO = require('../models/tagged_fishes').TaggedFishesDAO,
    UsersDAO = require('../models/users').UsersDAO,
    ImagesDAO = require('../models/images').ImagesDAO,
    path = require('path'),
    fs = require('fs'),
    json2csv = require('json2csv');

/* The ContentHandler must be constructed with a connected db */
function ContentHandler (db) {
    "use strict";

    var institutions = new InstitutionsDAO(db);
    var rfidadata = new RFIDDataDAO(db);
    var species = new SpeciesDAO(db);
    var collectors = new CollectorsDAO(db);
    var tagged_fishes = new TaggedFishesDAO(db);
    var users = new UsersDAO(db);
    var images = new ImagesDAO(db);

    var insertImage = function(imgFile, callback){
        console.log("aqui");
        if(imgFile.name){
            var addZero = function (i) {
                if (i < 10) {
                    i = "0" + i;
                }
                return i;
            }

            var filename = path.basename(imgFile.path);
            var extension = path.extname(imgFile.name).toLowerCase();
            var date = new Date;

            var d = addZero(date.getDate());
            var M = addZero(date.getMonth());
            var y = addZero(date.getFullYear());

            var h = addZero(date.getHours());
            var m = addZero(date.getMinutes());
            var s = addZero(date.getSeconds());

            var appDir = path.dirname(require.main.filename);

            var uniqueFileName =  d+'_'+M+'_'+y+'-'+h+m+s+"_" + filename+extension;
            var imagePath = appDir+'/public/uploads/images/'+uniqueFileName;
            console.log(imagePath);
            
            fs.createReadStream(imgFile.path).pipe(fs.createWriteStream(imagePath));

            // name, image_path, type, size, 
            var file = { 
                         name: uniqueFileName,
                         image_path: imagePath,
                         type: imgFile.type,
                         size: imgFile.size,
                         insert_date: (new Date).toISOString()
                       };

            images.add(file, function(err){
                if(err) {
                    console.log("Error upload file: " + err);
                    callback(null);
                    return next(err);
                }
                callback(file.name);
            });
        }else{
            callback(''); 
        }
    }


    this.displayMainPage = function(req, res, next) {
        "use strict";

        institutions.getInstitutionsIdNameHash(function(err, institutions_hash){
            collectors.getCollectors(function(err,result){
                if(err) return next(err);
                
                for(var key in result){
                    result[key].institution_name = institutions_hash[result[key].institution_id];
                }

                return res.render('home', {
                    title: 'FishBook - Home',
                    username: req.username,
                    admin: '',
                    login_error: '',
                    collectors: JSON.stringify(result)
                });
            });
        });


    }

    /* Institutions RESTful*/
    this.displayInstitutions = function(req, res, next) {
        "use strict";        

        institutions.getInstitutions(function(err, result){
            if(err) return next(err);

            return res.render('institutions', {
                title: 'FishBook - Institutions',
                username: req.username,
                admin: req.admin,                
                login_error: '',
                institutions: JSON.stringify(result)
            });
        });
    }

    this.displayAddInstitutions = function(req, res, next) {
        "use strict";        

        return res.render('add_institutions', {
                title: 'FishBook - Add new Institution',
                username: req.username,
                admin: req.admin,                
                login_error: '',
                institution: ''
        });
    }

    this.handleAddInstitutions = function(req, res, next) {
        "use strict";

        insertImage(req.files.imgSrc, function(imageName) {
            "use strict";

            var location = req.body.location.split(',');

            var institution = {
                name: req.body.name,
                image_name: imageName,
                lat: location[0],
                lng: location[1]
            };

            institutions.add(institution, function(err) {
                if (err) return next(err);

                return res.redirect("/institutions");
            }); 
        });        
    }

    this.displayUpdateInstitutions = function(req, res, next) {
        "use strict";   
        institutions.getInstitutionById(req.params.id,  function(err, institution_item){
            if (err) throw err;
            console.log(institution_item);
            return res.render('update_institutions', {
                    title: 'FishBook - Update Institutions',
                    username: req.username,
                    admin: req.admin,
                    institution_item : JSON.stringify(institution_item)
            });            
        });
        
    }

    this.handleUpdateInstitutions = function(req, res, next) {
        "use strict";

        // insertImage(req.files.image_name, function(imageName) {
        // cant get image_name by the jquery post.
        insertImage('', function(imageName) {

            var location = req.body.location.split(',');

            var institution = {
                _id: req.body.institution_id,
                name: req.body.name,
                image_name: imageName,
                lat: location[0],
                lng: location[1]
            };

            // even if there is no logged in user, we can still post a comment
            institutions.save(institution, function(err) {
                "use strict";

                if (err) return next(err);

                return res.redirect("/institutions");
            });
        });

        
    }

    this.handleRemoveInstitutions = function(req, res, next) {
        "use strict";

        var institution = {
            _id: req.body.institution_id
        };

        // even if there is no logged in user, we can still post a comment
        institutions.remove(institution, function(err) {
            "use strict";

            if (err) return next(err);

            return res.redirect("/institutions");
        });
    }

    /* SPECIES */

    this.displaySpecies = function(req, res, next){
        "use strict";

        species.getSpecies(function(err,result){
            if(err) return next(err);

            return res.render('species', {
                title: 'FishBook - Species',
                username: req.username,
                admin: req.admin,
                login_error: '',
                species: JSON.stringify(result)
            });
        });
    };

    this.displayAddSpecies = function(req, res, next) {
        "use strict";        

        return res.render('add_species', {
                title: 'FishBook - Add new Specie',
                username: req.username,
                admin: req.admin,                
                login_error: '',
                specie: ''
        });
    }

    this.handleAddSpecies = function(req, res, next) {
        "use strict";
        var name = req.body.name;
        var image = req.files.image;      

        // even if there is no logged in user, we can still post a comment

        insertImage(image, function(imageName) {
            "use strict";
            species.add(name, imageName, function(err) {
                "use strict";

                if (err) return next(err);

                return res.redirect("/species");
            });
        });
    }

    this.displayUpdateSpecies = function(req, res, next) {
        "use strict";   
        species.getSpecieById(req.params.id,  function(err, species_item){
            if (err) throw err;

            console.log(JSON.stringify(species_item));
                            
            return res.render('update_species', {
                    title: 'FishBook - Update Species',
                    username: req.username,
                    admin: req.admin,
                    species_item : JSON.stringify(species_item)
            });            
        });
        
    }

    this.handleUpdateSpecies = function(req, res, next) {
        "use strict";

        // insertImage(req.files.image_name, function(imageName) {
        // cant get image_name by the jquery post.
        insertImage('', function(imageName) {
            var speciesObj = {
                _id: req.body.species_id,
                name: req.body.name,
                image_name: imageName
            };

            // even if there is no logged in user, we can still post a comment
            species.save(speciesObj, function(err) {
                "use strict";

                if (err) return next(err);

                return res.redirect("/species");
            });
        });

        
    }

    this.handleRemoveSpecies = function(req, res, next) {
        "use strict";

        var species_obj = {
            _id: req.body.species_id
        };

        species.remove(species_obj, function(err) {
            "use strict";

            if (err) return next(err);

            return res.redirect("/species");
        });
    }

    /* COLLECTORS */

    this.displayCollectors = function(req, res, next){
        "use strict";

        institutions.getInstitutionsIdNameHash(function(err, institutions_hash){
            collectors.getCollectors(function(err,result){
                if(err) return next(err);
                
                for(var key in result){
                    result[key].institution_name = institutions_hash[result[key].institution_id];
                }

                return res.render('collectors', {
                    title: 'FishBook - Collectors',
                    username: req.username,
                    admin: req.admin,
                    login_error: '',
                    collectors: JSON.stringify(result)
                });
            });
        });
    };

    this.displayAddCollectors = function(req, res, next) {
        "use strict";        
        institutions.getInstitutions(function(err, institutions_list){
            return res.render('add_collectors', {
                    title: 'FishBook - Add new Collector',
                    username: req.username,
                    admin: req.admin,                
                    login_error: '',
                    collector: '',
                    institutions_list: JSON.stringify(institutions_list)
            });            
        });

    }    

    this.displayUpdateCollectors = function(req, res, next) {
        "use strict";  
        collectors.getCollectorById(req.params.id,  function(err, collector_item) {     
            institutions.getInstitutions(function(err, institutions_list){                
                return res.render('update_collectors', {
                        title: 'FishBook - Add new Collector',
                        username: req.username,
                        admin: req.admin,                
                        login_error: '',
                        collector: JSON.stringify(collector_item),
                        institutions_list: JSON.stringify(institutions_list)
                });            
            });
        });
    }   

    this.handleAddCollectors = function(req, res, next) {
        "use strict";
        console.log("location: " + req.body.location);
        var location = req.body.location.split(',');

        var collector = {
            institution_id: req.body.institution_id,
            name: req.body.name,
            mac: req.body.mac,
            description : req.body.description,
            lat: location[0],
            lng: location[1],
            status: 'Offline'
        };

        // even if there is no logged in user, we can still post a comment
        collectors.add(collector, function(err) {
            "use strict";

            if (err) return next(err);

            return res.redirect("/collectors");
        });
    }

    this.handleUpdateCollectors = function(req, res, next) {
        "use strict";

        var location = req.body.location.split(',');

        var collector = {
            _id: req.body.collector_id,
            institution_id: req.body.institution_id,
            name: req.body.name,
            mac: req.body.mac,
            description : req.body.description,
            lat: location[0],
            lng: location[1],
            status: 'Offline'
        };

        // even if there is no logged in user, we can still post a comment
        collectors.save(collector, function(err) {
            "use strict";

            if (err) return next(err);

            return res.redirect("/collectors");
        });
    }

    this.handleRemoveCollectors = function(req, res, next) {
        "use strict";

        var collector = {
            _id: req.body.collector_id
        };

        // even if there is no logged in user, we can still post a comment
        collectors.remove(collector, function(err) {
            "use strict";

            if (err) return next(err);

            return res.redirect("/collectors");
        });
    }

    /* TAGGED FISHES */

    this.displayTaggedFishes = function(req, res, next){
        "use strict";

        species.getSpeciesIdNameHash(function(err, species_hash){
            institutions.getInstitutionsIdNameHash(function(err, institutions_hash){
                tagged_fishes.getTaggedFishes(function(err,result){
                    if(err) return next(err);

                    for(var key in result){
                        result[key].institution_name = institutions_hash[result[key].institution_id];
                        result[key].species_name = species_hash[result[key].species_id];
                    }

                    return res.render('tagged_fishes', {
                        title: 'FishBook - Tagged Fishes',
                        username: req.username,
                        admin: req.admin,
                        login_error: '',
                        tagged_fishes: JSON.stringify(result)
                    });
                });
            });   
        });
    };

    this.displayAddTaggedFishes = function(req, res, next) {
        "use strict";        

        species.getSpecies(function(err, species_list){
            institutions.getInstitutions(function(err, institutions_list){
                return res.render('add_tagged_fishes', {
                    title: 'FishBook - Add new Tagged Fish',
                    username: req.username,
                    admin: req.admin,                
                    login_error: '',
                    tagged_fishes: '',
                    species_list: JSON.stringify(species_list),
                    institutions_list: JSON.stringify(institutions_list)
                });
            });   
        });

     
    }    

    this.handleAddTaggedFishes = function(req, res, next) {
        "use strict";
     
        var species_id = req.body.species_id;   
        var institution_id = req.body.institution_id;
        var pit_tag = req.body.pit_tag;
        var capture_local = req.body.capture_local;
        var release_local = req.body.release_local;
        var total_length = req.body.total_length;
        var default_length = req.body.default_length;
        var weight = req.body.weight;
        var sex = req.body.sex;
        var observation = req.body.observation;

        // even if there is no logged in user, we can still post a comment
        tagged_fishes.add(  species_id, pit_tag, capture_local, release_local,
                            total_length, default_length, weight, sex, 
                            observation, institution_id, function(err) {
            "use strict";

            if (err) return next(err);

            return res.redirect("/tagged_fishes");
        });
    }

    this.displayUpdateTaggedFishes = function(req, res, next) {
        "use strict";   
        
        species.getSpecies(function(err, species_list){
            institutions.getInstitutions(function(err, institutions_list){
                tagged_fishes.getTaggedFishesById(req.params.id,  function(err, tagged_fish){
                    if (err) throw err;
                                  
                    return res.render('update_tagged_fishes', {
                        title: 'FishBook - Update Tagged Fishes',
                        username: req.username,
                        admin: req.admin,
                        tagged_fish : JSON.stringify(tagged_fish),
                        species_list: JSON.stringify(species_list),
                        institutions_list: JSON.stringify(institutions_list)
                    });            
                });
            });   
        });        
    }

    this.handleUpdateTaggedFishes = function(req, res, next) {
        "use strict";

        var tagged_fish_obj = {
                            _id : req.body.tagged_fish_id,
                            species_id : req.body.species_id,
                            pit_tag : req.body.pit_tag,
                            capture_local : req.body.capture_local,
                            release_local : req.body.release_local,
                            total_length : req.body.total_length,
                            default_length : req.body.default_length,
                            weight : req.body.weight,
                            sex : req.body.sex,
                            observation : req.body.observation,
                            institution_id : req.body.institution_id
        };

        tagged_fishes.save(tagged_fish_obj, function(err) {
            "use strict";

            if (err) return next(err);

            return res.redirect("/tagged_fishes");
        });
    }

    this.handleRemoveTaggedFishes = function(req, res, next) {
        "use strict";

        var tagged_fish_obj = {
            _id: req.body.tagged_fish_id
        };

        // even if there is no logged in user, we can still post a comment
        tagged_fishes.remove(tagged_fish_obj, function(err) {
            "use strict";

            if (err) return next(err);

            return res.redirect("/tagged_fishes");
        });
    }

    /* USERS */

    this.displayUsers = function(req, res, next){
        "use strict";

        users.getUsers(function(err,result){
            if(err) return next(err);

            return res.render('users', {
                title: 'FishBook - Users',
                username: req.username,
                admin: req.admin,
                login_error: '',
                users: JSON.stringify(result)
            });
        });
    };

    this.displayAddUsers = function(req, res, next) {
        "use strict";        

        return res.render('add_users', {
                title: 'FishBook - Add new user',
                username: req.username,
                admin: req.admin,                
                login_error: '',
                user: ''
        });
    }    

    this.handleAddUsers = function(req, res, next) {
        "use strict";
        var username = req.body.username;    
        var password = req.body.password;    
        var type = req.body.type;

        // even if there is no logged in user, we can still post a comment
        users.add(username, password, type, function(err) {
            "use strict";

            if (err) return next(err);

            return res.redirect("/users");
        });
    }

    this.displayProfile = function(req, res, next) {
        "use strict";

        var username = req.username;

        users.getUser(username, function(err, doc){
            return res.render('profile', {
                title: 'FishBook - User profile',
                username: req.username,
                admin: req.admin,                
                login_error: '',
                profile: doc
            });
        });       

        
    }

    this.handleProfile = function(req, res, next) {
        "use strict";
        var username = req.username;
        var name = req.body.name;    
        var email = req.body.email;    
        var photo = req.files.photo;

        insertImage(photo, function(imageName) {
            "use strict";
            users.update(username, name, email, imageName, function(err) {
                "use strict";

                if (err) return next(err);

                return res.redirect("/profile");
            });
        });
    }

    /* SEARCH RFIDS */

    this.displaySearchRFIDs = function(req, res, next){
        "use strict";

        species.getSpecies(function(err, species_list){
            institutions.getInstitutions(function(err, institutions_list){
                collectors.getCollectors(function(err, collectors_list){
                    return res.render('search_rfids', {
                         title: 'FishBook - Search/Export Data',
                         username: req.username,
                         admin: req.admin,                
                         login_error: '',
                         result_list: JSON.stringify([]),
                         species_list: JSON.stringify(species_list),
                         institutions_list: JSON.stringify(institutions_list),
                         collectors_list: JSON.stringify(collectors_list)
                     });
                 });
             });
        });
    }

    this.handleSearchRFIDs = function(req, res, next) {
        "use strict";

        var query = new Object;
        var post_obj = {
            'collector_id' : req.body.collector_id,
            'species_id' : req.body.species_id,
            'institution_id' : req.body.institution_id,
            'tag' : req.body.tag,
            'sortBy' : req.body.sortBy,
            'sortOrder' : req.body.sortOrder,
            'results_limit' : req.body.results_limit,
            'exportToCSV' : req.body.exportToCSV
        };

        var collector_id = post_obj.collector_id;
        var tag = parseInt(post_obj.tag);
        var sortBy = post_obj.sortBy;
        var sortOrder = parseInt(post_obj.sortOrder);
        var results_limit = parseInt(post_obj.results_limit);
        var exportToCSV = post_obj.exportToCSV;


        if(tag)
            query.identificationcode = tag;
        if(collector_id)
            query.idcollectorpoint = collector_id;


        collectors.getCollectorsMacNameHash(function(err, collectors_hash){
            species.getSpeciesIdNameHash(function(err, species_hash){
                institutions.getInstitutionsIdNameHash(function(err, institutions_hash){
                    tagged_fishes.getTaggedFishesByPitTagHash(function(err, tagged_fish_hash){
                        rfidadata.findRFIDData(query, sortBy, sortOrder, results_limit, function(err,result){
                             if(err) return next(err);
     
                             for(var key in result){

                                console.log('key' + key);
                                
                                var institution_id = collectors_hash[result[key].macaddress].institution_id;
                                if(post_obj.institution_id && post_obj.institution_id != institution_id){
                                    //if an institution was specified on search parameters,
                                    //and if it is different of the actual result key, so it is
                                    //not valid.
                                    result.splice(key, 1);
                                    continue;
                                }

                                var species_id = tagged_fish_hash[result[key].identificationcode].species_id;
                                if(post_obj.species_id && post_obj.species_id != species_id){
                                    //if a species was specified on search parameters,
                                    //and if it is different of the actual result key, so it is
                                    //not valid.
                                    result.splice(key, 1);
                                    continue;
                                }

                                // If institution_id is null, the Institution is unknown
                                if(institution_id){
                                    result[key].institution_name = institutions_hash[institution_id];
                                }else{
                                    result[key].institution_name = 'Unknown';
                                }

                                result[key].species_name = species_hash[species_id];
                                result[key].collector_name = collectors_hash[result[key].macaddress].name;
                                console.log('rfiddata: ' + JSON.stringify(result[key]));
                             }
                            
                            if(result.length > 0 ){
                            
                                if(exportToCSV){
                                
                                         json2csv(
                                             {
                                                 data: result, 
                                                 fields: ['idcollectorpoint', 
                                                     'idantena', 
                                                     'identificationcode',
                                                     'applicationcode',
                                                     'datetime']}, function(err, csv) {
                                             if (err) return next(err);
                                             
                                             var appDir = path.dirname(require.main.filename);
                                             var wstream = fs.createWriteStream(appDir + '/public/downloads/export.csv');
                                             wstream.write(csv);
                                             wstream.end(function(){
                                                 res.download(appDir + '/public/downloads/export.csv');    
                                             });
                                             
                                         });
                                    // }
                                 }else{
                                    species.getSpecies(function(err, species_list){
                                        institutions.getInstitutions(function(err, institutions_list){
                                            collectors.getCollectors(function(err, collectors_list){
                                                 return res.render('search_rfids', {
                                                 title: 'FishBook - Search/Export Data',
                                                 username: req.username,
                                                 admin: req.admin,                
                                                 result_status: '',
                                                 result_list: JSON.stringify(result),
                                                 species_list: JSON.stringify(species_list),
                                                 institutions_list: JSON.stringify(institutions_list),
                                                 collectors_list: JSON.stringify(collectors_list),
                                                 old_post : post_obj
                                                });
                                            });
                                        });   
                                    });
                                }
                            }else{
                                species.getSpecies(function(err, species_list){
                                    institutions.getInstitutions(function(err, institutions_list){
                                        collectors.getCollectors(function(err, collectors_list){
                                            return res.render('search_rfids', {
                                                 title: 'FishBook - Search/Export Data',
                                                 username: req.username,
                                                 admin: req.admin,                
                                                 result_status: 'No results found.',
                                                 result_list: '[]',
                                                 species_list: JSON.stringify(species_list),
                                                 institutions_list: JSON.stringify(institutions_list),
                                                 collectors_list: JSON.stringify(collectors_list),
                                                 old_post : post_obj
                                            });
                                        });
                                    });   
                                });
                            }           
                        });
                    });
                });
            });
        });
    }

    /* IMPORT */

    this.displayImport = function(req, res, next) {
        "use strict";        

        return res.render('import', {
                title: 'FishBook - Import data',
                username: req.username,
                admin: req.admin,                
                login_error: '',
                status: ''
        });
    }

    this.handleImport = function(req, res, next) {
        "use strict";   

        console.log(req.files.import_file);



        res.redirect("/import");
    }


    this.displayMonActivities = function(req, res, next) {
        "use strict";

        collectors.getCollectorsMacNameHash(function(err, collectors_hash){
            species.getSpeciesIdNameHash(function(err, species_hash){
                institutions.getInstitutionsIdNameHash(function(err, institutions_hash){
                    tagged_fishes.getTaggedFishesByPitTagHash(function(err, tagged_fish_hash){                    
                        
                        rfidadata.getRFIDData(20, function(err, result){
                            if(err) return next(err);                        

                            for(var key in result) {
                                // Institution ID from the collector that captured the PIT_TAG
                                var institution_id = collectors_hash[result[key].macaddress].institution_id;
                                var species_id = tagged_fish_hash[result[key].identificationcode].species_id;
                                console.log('collectors_hash: '+JSON.stringify(collectors_hash));
                                console.log('institutions_hash: '+JSON.stringify(institutions_hash));

                                // If institution_id is null, the Institution is unknown
                                if(institution_id){
                                    result[key].institution_name = institutions_hash[institution_id];
                                }else{
                                    result[key].institution_name = 'Unknown';
                                }
                                result[key].species_name = species_hash[species_id];
                                result[key].collector_name = collectors_hash[result[key].macaddress].name;
                                console.log('rfiddata: ' + JSON.stringify(result[key]));
                            }

                            return res.render('mon_activities', {
                                title: 'FishBook - Collectors activities',
                                username: req.username,
                                admin: req.admin,                
                                login_error: '',
                                rfiddata_list: JSON.stringify(result)
                            });

                        });
                    });
                });                
            });
        });


    }

    this.displayMonCollectors = function(req, res, next){
        institutions.getInstitutionsIdNameHash(function(err, institutions_hash){
            collectors.getCollectors(function(err,result){
                if(err) return next(err);
                
                for(var key in result){
                    result[key].institution_name = institutions_hash[result[key].institution_id];
                }

                return res.render('mon_collectors', {
                    title: 'FishBook - Collectors',
                    username: req.username,
                    admin: req.admin,
                    login_error: '',
                    collectors: JSON.stringify(result)
                });
            });
        });
    }

    this.sendCollectionSummary = function(req, res, next){

    }

}

module.exports = ContentHandler;
