'use strict';

var _ = require('lodash');
var google = require('googleapis');
var youtube = google.youtube('v3');
var config = require('../../../config/environment');
var OAuth2 = google.auth.OAuth2;
var oauth2Client = new OAuth2(config.google.clientID, config.google.clientSecret, config.google.callbackURL);

exports.index = function(req, res) {
  oauth2Client.setCredentials({
    access_token: req.user.google.accessToken,
    refresh_token: req.user.google.refreshToken,
  });

  var params = {
    auth: oauth2Client,
    part: 'snippet,status',
    id: req.query.playlistId,
  };

  youtube.playlists.list(params, function(err, response) {
    if(err) { return res.status(500).send(err); }
    return res.status(200).json(response.items);
  });
};

