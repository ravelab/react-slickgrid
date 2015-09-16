var mysql  = require('mysql');
var config = require ('./config');

var connection = mysql.createConnection (config.mysql);

connection.connect (function (error) {
  if (error) {
    console.info ('Error connecting to MySQL', error);
  } else {
    console.info ('Connected to MySQL', connection.threadId);
  }
});

module.exports = connection;
