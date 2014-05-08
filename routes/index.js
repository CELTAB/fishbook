var SessionHandler = require('./session')
  , ContentHandler = require('./content')
  , ErrorHandler = require('./error').errorHandler;

module.exports = exports = function(app, db) {

    var sessionHandler = new SessionHandler(db);
    var contentHandler = new ContentHandler(db);

    // Middleware to see if a user is logged in
    app.use(sessionHandler.isLoggedInMiddleware);  

    // Entries GET
    app.get('/', contentHandler.displayMainPage);
    app.get('/institutions', contentHandler.displayInstitutions);
    app.get('/species', contentHandler.displaySpecies);
    app.get('/collectors', contentHandler.displayCollectors);
    app.get('/tagged_fishes', contentHandler.displayTaggedFishes);
    app.get('/users', contentHandler.displayUsers);
    // app.get('/mon_collectors', contentHandler.displayMonCollectors);
    app.get('/mon_activities', contentHandler.displayMonActivities);
    app.get('/profile', contentHandler.displayProfile);
    app.get('/search_rfids', contentHandler.displaySearchRFIDs);
    app.get('/import', contentHandler.displayImport);

    // ##### GET for add_ *forms
    app.get('/add_institutions', contentHandler.displayAddInstitutions);
    app.get('/add_species', contentHandler.displayAddSpecies);
    app.get('/add_collectors', contentHandler.displayAddCollectors);
    app.get('/add_tagged_fishes', contentHandler.displayAddTaggedFishes);
    app.get('/add_users', contentHandler.displayAddUsers);

    // Entries POST
    app.post('/add_institutions', contentHandler.handleAddInstitutions);
    app.post('/add_species', contentHandler.handleAddSpecies);
    app.post('/add_collectors', contentHandler.handleAddCollectors);
    app.post('/add_tagged_fishes', contentHandler.handleAddTaggedFishes);
    app.post('/add_users', contentHandler.handleAddUsers);
    app.post('/search_rfids', contentHandler.handleSearchRFIDs);
    app.post('/profile', contentHandler.handleProfile);
    app.post('/import', contentHandler.handleImport);


    // Authentication
    app.post('/login', sessionHandler.handleLoginRequest);
    app.get('/logout', sessionHandler.displayLogoutPage);


    // Error handling middleware
    app.use(ErrorHandler);

}