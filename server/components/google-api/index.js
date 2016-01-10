'use strict';

var google = require('googleapis');
var youtube = google.youtube('v3');
var _ = require('lodash');
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
  setOAuth(req.user);
  oauth2Client.getAccessToken((err, token) => {
    if (err) { next(err); }

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


function setOAuth(user) {
  oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_ID,
    process.env.GOOGLE_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );

  oauth2Client.setCredentials({
    access_token: user.google.accessToken,
    refresh_token: user.google.refreshToken,
  });
}

exports.youtube = execute;
exports.readyApi = readyApi;
exports.setOAuth = setOAuth;
