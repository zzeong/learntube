'use strict';

var _ = require('lodash');
var config = require('../../../config/environment');
var google = require('googleapis');
var youtube = google.youtube('v3');
var OAuth2 = google.auth.OAuth2;
var oauth2Client = new OAuth2(config.google.clientID, config.google.clientSecret, config.google.callbackURL);


exports.create = function(req, res) {
  oauth2Client.setCredentials({
    access_token: req.user.google.accessToken,
    refresh_token: req.user.google.refreshToken,
  });
  var params = _.assign({
    auth: oauth2Client,
    part: 'snippet,status',
    resource: req.body,
  }, req.query);

  youtube.playlistItems.insert(params, function(err, item) {
    if(err) { return res.status(500).send(err); }

    youtube.videos.list({
      auth: config.google.serverKey,
      part: 'contentDetails',
      id: item.snippet.resourceId.videoId,
      fields: 'items(contentDetails(duration))',
    }, function(err, response) {
      if(err) { return res.status(500).send(err); }
      item.contentDetails = response.items[0].contentDetails;

      return res.status(201).json(item);
    });
  });
};
