'use strict';

var google = require('googleapis');
var youtube = google.youtube('v3');
var _ = require('lodash');
var config = require('../../config/environment').google;
var oauth2Client = null;

function execute(method, params) {
  params = params || {};
  params.auth = params.auth || oauth2Client;
  return new Promise((resolve, reject) => {
    _.get(youtube, method)(params, (err, res) => {
      if (err) { return reject(err); }
      return resolve(res);
    });
  });
}

function readyApi(req, res, next) {
  oauth2Client = new google.auth.OAuth2(config.clientID, config.clientSecret, config.callbackURL);

  oauth2Client.setCredentials({
    access_token: req.user.google.accessToken,
    refresh_token: req.user.google.refreshToken,
  });

  oauth2Client.getAccessToken((err, token) => {
    let userToken = req.user.google.accessToken;
    if (userToken !== token) {
      userToken = token;
      req.user.save()
      .then(next.bind(null, null));
    } else {
      next();
    }
  });
}

exports.youtube = execute;
exports.readyApi = readyApi;
