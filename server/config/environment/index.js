'use strict';

var path = require('path');
var _ = require('lodash');
var src = require('./' + process.env.NODE_ENV + '.js');

var all = {
  // Root path of server
  root: path.normalize(__dirname + '/../../..'),

  // Should we populate the DB with sample data?
  seedDB: false,
  seedWithOAuth: false,

  // List of user roles
  userRoles: ['guest', 'user', 'admin'],

  google: {
    maxResults: 20
  },

  // MongoDB connection options
  mongo: {
    options: {
      db: { safe: true }
    }
  },
};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(all, src || {});
