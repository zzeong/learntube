'use strict';

var g = require('../../../../components/google-api');
var config = require('../../../../config/environment');

exports.index = function(req, res) {
  g.oauth2Client.setCredentials({
    access_token: req.user.google.accessToken,
    refresh_token: req.user.google.refreshToken,
  });

  g.youtube('channels.list', {
    auth: g.oauth2Client,
    part: 'contentDetails',
    mine: true,
    fields: 'items(contentDetails)',
  })
  .then(function(response) {
    return g.youtube('playlistItems.list', {
      auth: g.oauth2Client,
      part: 'id,snippet,status',
      playlistId: response.items[0].contentDetails.relatedPlaylists.uploads,
      maxResults: config.google.maxResults,
      fields: 'items(id,snippet,status),nextPageToken',
    });
  }, function(error) {
    if(error) { return res.status(500).send(error); }
  })
  .then(function(response) {
    var resBody = { items: response.items };
    if(response.nextPageToken) { 
      resBody.pageToken = response.nextPageToken;
    }

    return res.status(200).json(resBody);
  }, function(error) {
    if(error) { return res.status(500).send(error); }
  });
};
