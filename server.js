var express = require ("express");
var bodyParser = require('body-parser');
var records = require ('./server/routes/records');

var server = express ();

/*
 *  Required for POST requests.
 */
server.use (bodyParser.json({limit: '50mb'}));
server.use (bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 5000}));

server.use ('/', express.static (__dirname + '/public'));
server.use ('/records', records);

/*
 *  Starts the node instance on port.
 */
server.listen (4000, function() {
  console.log ('Listening on port  4000');
});
