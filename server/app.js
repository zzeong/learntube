/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Inject environment variables to process.env at production
if (process.env.NODE_ENV === 'production') {
  var envInjector = require('node-env-injector');
  envInjector.load(require('./config/local.env.js'));
}

var express = require('express');
var mongoose = require('mongoose');
var config = require('./config/environment');

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.connection.on('error', function (err) {
  console.error('MongoDB connection error: ' + err);
  process.exit(-1);
});
// Populate DB with sample data
if (config.seedDB) { require('./config/seed'); }

// Setup server
var app = express();
var server = require('http').createServer(app);
require('./config/express')(app);
require('./routes')(app);

// Start server and prevent multiple listening
if (!module.parent) {
  server.listen(config.port, config.ip, function () {
    console.log('Express server listening on http://%s:%d, in %s mode', config.ip, config.port, app.get('env'));
  });
}

// Expose app
exports = module.exports = app;
