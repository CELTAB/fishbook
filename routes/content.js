var InstitutionsDAO = require('../models/institutions').InstitutionsDAO
  , sanitize = require('validator').sanitize, // Helper to sanitize form input
    RFIDDataDAO = require('../models/RFIDData').RFIDDataDAO;

/* The ContentHandler must be constructed with a connected db */
function ContentHandler (db) {
    "use strict";

    var institutions = new InstitutionsDAO(db);
    var rfidadata = new RFIDDataDAO(db);

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
        var logo = req.body.logo;      

        // even if there is no logged in user, we can still post a comment
        institutions.add(name, logo, function(err) {
            "use strict";

            if (err) return next(err);

            return res.redirect("/institutions");
        });
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
