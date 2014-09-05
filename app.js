/****************************************************************************
**
** www.celtab.org.br
**
** Copyright (C) 2013
**                     Gustavo Valiati <gustavovaliati@gmail.com>
**                     Luis Valdes <luisvaldes88@gmail.com>
**                     Thiago R. M. Bitencourt <thiago.mbitencourt@gmail.com>
**
** This file is part of the FishBook project
**
** This program is free software; you can redistribute it and/or
** modify it under the terms of the GNU General Public License
** as published by the Free Software Foundation; version 2
** of the License.
**
** This program is distributed in the hope that it will be useful,
** but WITHOUT ANY WARRANTY; without even the implied warranty of
** MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
** GNU General Public License for more details.
**
** You should have received a copy of the GNU General Public License
** along with this program; if not, write to the Free Software
** Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
**
****************************************************************************/

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

      collectorPointServer.ServerEmitter.on('collectors_status', function (data) {
        socket.emit('collectors_status',data);
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
