/**
 * Main application file
 */

'use strict';

require('dotenv').load();

var express = require('express');
//var mongoose = require('mongoose');
var stealth = require('./components/stealth');
var cfg = require('./config/environment');

// Connect to back services
stealth
.addPorter('db', `mongodb://${process.env.MONGO_IP}:${process.env.MONGO_DBNAME}`, cfg.mongo.options)
.addPorter('mq', `amqp://${process.env.RABBIT_URI}`)
.activate();

stealth.on('error', exitWebapp(1));

// Populate DB with sample data
if (cfg.seedDB) { require('./config/seed'); }

// Setup server
var app = express();
var server = require('http').createServer(app);
require('./config/express')(app);
require('./routes')(app);
var mqContext = stealth.porter.mq.service;
require('./config/mq')(mqContext);

// Start server and prevent multiple listening
if (!module.parent) {
  server.listen(process.env.PORT, process.env.IP, function () {
    console.log(`Express server listening on http://${process.env.IP}:${process.env.PORT}, in ${app.get('env')} mode`);
  });
}

function exitWebapp(code) {
  return () => { process.exit(code); };
}

// Expose app
exports = module.exports = app;
