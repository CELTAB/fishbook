var InstitutionsDAO = require('../models/institutions').InstitutionsDAO
  , sanitize = require('validator').sanitize, // Helper to sanitize form input
    RFIDDataDAO = require('../models/RFIDData').RFIDDataDAO,
    SpeciesDAO = require('../models/species').SpeciesDAO,
    CollectorsDAO = require('../models/collectors').CollectorsDAO,
    TaggedFishesDAO = require('../models/tagged_fishes').TaggedFishesDAO,
    UsersDAO = require('../models/users').UsersDAO,
    ImagesDAO = require('../models/images').ImagesDAO,
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
        var uniqueFileName = imgFile.path + "_" + (new Date).toISOString()

        var fl = fs.createReadStream(imgFile.path);

        console.log("FL opened! - " + uniqueFileName);
        fl.pipe(fs.createWriteStream(__dirname+'/public/uploads/images/'+uniqueFileName));

        // name, image_path, type, size, 
        var file = { 
                     name: uniqueFileName,
                     image_path: imgFile.path,
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
            callback(uniqueFileName);
        });
    }


    this.displayMainPage = function(req, res, next) {
        "use strict";

        return res.render('index', {
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

        var imgName = "";

        console.log(req.files.imgSrc);
        insertImage(req.files.imgSrc, function(imageName) {
            "use strict";

            if(imageName){
                imgName = imageName;
            }
        });        

        institutions.add(name, imgName, function(err) {
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

        collectors.getCollectors(function(err,result){
            if(err) return next(err);

            return res.render('collectors', {
                title: 'FishBook - Collectors',
                username: req.username,
                admin: req.admin,
                login_error: '',
                collectors: JSON.stringify(result)
            });
        });
    };

    this.displayAddCollectors = function(req, res, next) {
        "use strict";        

        return res.render('add_collectors', {
                title: 'FishBook - Add new Collector',
                username: req.username,
                admin: req.admin,                
                login_error: '',
                collector: ''
        });
    }    

    this.handleAddCollectors = function(req, res, next) {
        "use strict";
        var _id = req.body._id;
        var name = req.body.name;      
        var mac = req.body.mac;      
        var description = req.body.description;      

        // even if there is no logged in user, we can still post a comment
        collectors.add(_id, name, mac, description, function(err) {
            "use strict";

            if (err) return next(err);

            return res.redirect("/collectors");
        });
    }

    /* TAGGED FISHES */

    this.displayTaggedFishes = function(req, res, next){
        "use strict";

        tagged_fishes.getTaggedFishes(function(err,result){
            if(err) return next(err);

            return res.render('tagged_fishes', {
                title: 'FishBook - Tagged Fishes',
                username: req.username,
                admin: req.admin,
                login_error: '',
                tagged_fishes: JSON.stringify(result)
            });
        });
    };

    this.displayAddTaggedFishes = function(req, res, next) {
        "use strict";        

        return res.render('add_tagged_fishes', {
                title: 'FishBook - Add new Tagged Fish',
                username: req.username,
                admin: req.admin,                
                login_error: '',
                tagged_fishes: ''
        });
    }    

    this.handleAddTaggedFishes = function(req, res, next) {
        "use strict";
     
        var specie = req.body.specie;   
        var pit_tag = req.body.pit_tag;
        var capture_local = req.body.capture_local;
        var release_local = req.body.release_local;
        var total_length = req.body.total_length;
        var default_length = req.body.default_length;
        var weight = req.body.weight;
        var sex = req.body.sex;
        var observation = req.body.observation;   

        // even if there is no logged in user, we can still post a comment
        tagged_fishes.add(  specie, pit_tag, capture_local, release_local,
                            total_length, default_length, weight, sex, 
                            observation, function(err) {
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

        rfidadata.getRFIDData(20, function(err, result){
            if(err) return next(err);
            return res.render('mon_activities', {
                title: 'FishBook - Collectors activities',
                username: req.username,
                admin: req.admin,                
                login_error: '',
                rfiddata_list: JSON.stringify(result)
            });

        });
    }

}

module.exports = ContentHandler;
