'use strict';

var path = require('path');
var _ = require('lodash');

function requiredProcessEnv(name) {
  if (!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable');
  }
  return process.env[name];
}

// All configurations will extend these options
// ============================================
var all = {
  env: process.env.NODE_ENV,

  // Root path of server
  root: path.normalize(__dirname + '/../../..'),

  // Server port
  port: process.env.PORT || 9000,

  // Server IP
  ip: process.env.IP || 'localhost',

  // Should we populate the DB with sample data?
  seedDB: false,
  seedWithOAuth: false,

  // Secret for session, you will want to change this and make it an environment variable
  secrets: {
    session: 'learntube-secret'
  },

  // List of user roles
  userRoles: ['guest', 'user', 'admin'],

  // MongoDB connection options
  mongo: {
    options: {
      db: {
        safe: true
      }
    }
  },

  aws: {
    accessKeyId: process.env.AWSAccessKeyId || 'id',
    secretKey: process.env.AWSSecretKey || 'secret',
    s3Bucket: process.env.AWSS3Bucket || '',
  },

  google: {
    clientID:     process.env.GOOGLE_ID || 'id',
    clientSecret: process.env.GOOGLE_SECRET || 'secret',
    callbackURL:  (process.env.DOMAIN || '') + '/auth/google/callback',
    maxResults: 50,
    serverKey: 'AIzaSyBQVxlBd8w_jm7ucPo9r8iO6g5rQwVnw7o',
  }
};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
  all,
  require('./' + process.env.NODE_ENV + '.js') || {});
