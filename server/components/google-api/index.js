'use strict';

var google = require('googleapis');
var youtube = google.youtube('v3');
var config = require('../../config/environment');
var OAuth2 = google.auth.OAuth2;
var oauth2Client = new OAuth2(config.google.clientID, config.google.clientSecret, config.google.callbackURL);
var Promise = require('promise');


exports.youtube = function (method, params) {
  return new Promise(function (resolve, reject) {
    var step = method.split('.');
    youtube[step[0]][step[1]](params, function (err, res) {
      if (err) { return reject(err); }
      return resolve(res);
    });
  });
};

exports.oauth2Client = oauth2Client;
