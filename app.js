var express = require('express')
  , app = express() // Web framework to handle routing requests
  , cons = require('consolidate') // Templating library adapter for Express
  , MongoClient = require('mongodb').MongoClient // Driver for connecting to MongoDB
  , routes = require('./routes'), // Routes for our application
  path = require('path');

// Socket.io
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);

MongoClient.connect('mongodb://localhost:27017/rfidmonitor', function(err, db) {
    "use strict";
    if(err) throw err;

    // Register our templating engine
    app.engine('html', cons.swig);
    app.set('view engine', 'jade');
    app.set('views', path.join(__dirname, 'views'));
    app.use(express.static(path.join(__dirname, 'public')));

    // Port
    app.set('port', process.env.PORT || 8082);

    // Express middleware to populate 'req.cookies' so we can access cookies
    app.use(express.cookieParser());

    // Express middleware to populate 'req.body' so we can access POST variables
    app.use(express.bodyParser());

    // When in dev print pretty html
    if ('development' == app.get('env')) {
      app.use(express.logger('dev'));
      app.locals.pretty = true;
      
      io.configure('development', function () {
        io.disable('log');
      });
    }

    // Application routes
    routes(app, db);

    // Server Socket TCP/IP
    var collectorPointServer = require('./core/CollectorPointServer')(io, db);

    // SocketIO
    io.sockets.on('connection', function (socket) {
      
      collectorPointServer.ServerEmitter.on('rfiddata', function (data) {
        socket.emit('rfiddata',data);
      });

      socket.on('end', function (data) {
        console.log('Disconnect: '+data);
      });
    });


    server.listen(app.get('port'), function(){
      console.log('Express server listening on port ' + app.get('port'));
    });


// Start listeting TCP/IP connections
    collectorPointServer.start();
});
