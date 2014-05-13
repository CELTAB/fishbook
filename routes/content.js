var InstitutionsDAO = require('../models/institutions').InstitutionsDAO
  , sanitize = require('validator').sanitize, // Helper to sanitize form input
    RFIDDataDAO = require('../models/RFIDData').RFIDDataDAO,
    SpeciesDAO = require('../models/species').SpeciesDAO,
    CollectorsDAO = require('../models/collectors').CollectorsDAO,
    TaggedFishesDAO = require('../models/tagged_fishes').TaggedFishesDAO,
    UsersDAO = require('../models/users').UsersDAO,
    ImagesDAO = require('../models/images').ImagesDAO,
    path = require('path'),
    fs = require('fs');

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
    }


    this.displayMainPage = function(req, res, next) {
        "use strict";

        return res.render('home', {
            title: 'FishBook - Home',
            username: req.username,
            admin: '',
            login_error: ''
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
        var name = req.body.name;

        insertImage(req.files.imgSrc, function(imageName) {
            "use strict";

            institutions.add(name, imageName, function(err) {
                if (err) return next(err);

                return res.redirect("/institutions");
            }); 
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
        var image = req.body.image;      

        // even if there is no logged in user, we can still post a comment
        species.add(name, image, function(err) {
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

    this.handleAddCollectors = function(req, res, next) {
        "use strict";
        var institution_id = req.body.institution_id;
        var name = req.body.name;      
        var mac = req.body.mac;      
        var description = req.body.description;      

        // even if there is no logged in user, we can still post a comment
        collectors.add(institution_id, name, mac, description, function(err) {
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
        var photo = req.body.photo;

        // even if there is no logged in user, we can still post a comment
        users.update(username, name, email, photo, function(err) {
            "use strict";

            if (err) return next(err);

            return res.redirect("/profile");
        });
    }

    /* SEARCH RFIDS */

    this.displaySearchRFIDs = function(req, res, next){
        "use strict";

        return res.render('search_rfids', {
                title: 'FishBook - Search/Export Data',
                username: req.username,
                admin: req.admin,                
                login_error: '',
                result_list: JSON.stringify([])
        });

    };

    this.handleSearchRFIDs = function(req, res, next) {
        "use strict";

        var query = new Object;

        var collector_id = parseInt(req.body.collector_id);
        var tag = parseInt(req.body.tag);
        var sortBy = req.body.sortBy;
        var sortOrder = parseInt(req.body.sortOrder);
        var results_limit = parseInt(req.body.results_limit);

        if(collector_id)
            query.idcollectorpoint = collector_id;
        if(tag)
            query.identificationcode = tag;


        // even if there is no logged in user, we can still post a comment
        rfidadata.findRFIDData(query, sortBy, sortOrder, results_limit, function(err,result){
            if(err) return next(err);

            return res.render('search_rfids', {
                title: 'FishBook - Search/Export Data',
                username: req.username,
                admin: req.admin,
                login_error: '',
                result_list: JSON.stringify(result)
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

        collectors.getCollectorsIdNameHash(function(err, collectors_hash){
            species.getSpeciesIdNameHash(function(err, species_hash){
                institutions.getInstitutionsIdNameHash(function(err, institutions_hash){
                    rfidadata.getRFIDData(20, function(err, result){
                        if(err) return next(err);

                        for(var key in result){
                            result[key].institution_name = institutions_hash[result[key].institution_id];
                            result[key].species_name = species_hash[result[key].species_id];
                            result[key].collector_name = species_hash[result[key].collector_id];
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


    }

    this.displayMonCollectors = function(req, res, next){
        
    }

}

module.exports = ContentHandler;
