'use strict';

var google = require('googleapis');
var youtube = google.youtube('v3');
var config = require('../../config/environment');
var OAuth2 = google.auth.OAuth2;
var oauth2Client = new OAuth2(config.google.clientID, config.google.clientSecret, config.google.callbackURL);
var Promise = require('promise');

function Youtube(s, p) {
  this.step = s;
  this.params = p;
  this.previousAccessToken = '';
}

Youtube.prototype.execute = function (method, params) {
  var that = this;
  this.step = method ? method.split('.') : this.step;
  this.params = params || this.params;
  this.params.auth = oauth2Client;
  this.previousAccessToken = oauth2Client.credentials.access_token;

  return new Promise(function (resolve, reject) {
    youtube[that.step[0]][that.step[1]](that.params, function (err, res) {
      if (err) { return reject(err); }
      return resolve(res);
    });
  });
};

Youtube.prototype.isTokenUpdated = function () {
  return this.previousAccessToken !== oauth2Client.credentials.access_token;
};

Youtube.prototype.getToken = function () {
  return {
    accessToken: oauth2Client.credentials.access_token,
    refreshToken: oauth2Client.credentials.refresh_token,
  };
};


var yt = new Youtube();

exports.youtube = yt.execute;
exports.isTokenUpdated = yt.isTokenUpdated;
exports.getToken = yt.getToken;

exports.setCredentials = function (req, res, next) {
  oauth2Client.setCredentials({
    access_token: req.user.google.accessToken,
    refresh_token: req.user.google.refreshToken,
  });
  next();
};

