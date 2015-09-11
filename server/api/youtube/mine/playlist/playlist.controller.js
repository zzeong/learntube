'use strict';

var _ = require('lodash');
var g = require('../../../../components/google-api');
var config = require('../../../../config/environment');

exports.index = function(req, res) {
  g.oauth2Client.setCredentials({
    access_token: req.user.google.accessToken,
    refresh_token: req.user.google.refreshToken,
  });

  var params = {
    auth: g.oauth2Client, 
    part: 'id,snippet,status',
    mine: true,
    maxResults: config.google.maxResults,
    fields: 'items(id,snippet,status),nextPageToken',
  };

  g.youtube('playlists.list', params)
  .then(function(response) {
    var resBody = { items: response.items };
    if(response.nextPageToken) { 
      resBody.pageToken = response.nextPageToken;
    }
    return res.status(200).json(resBody);
  }, function(error) {
    return res.status(500).send(error); 
  });

};


exports.create = function(req, res) {
  g.oauth2Client.setCredentials({
    access_token: req.user.google.accessToken,
    refresh_token: req.user.google.refreshToken,
  });

  var params = _.assign({
    auth: g.oauth2Client,
    part: 'snippet,status',
    fields: 'id,snippet,status',
  }, req.body);

  g.youtube('playlists.insert', params)
  .then(function(item) {
    return res.status(201).json(item);
  }, function(error) {
    return res.status(500).send(error); 
  });
};


exports.destroy = function(req, res) {
  g.oauth2Client.setCredentials({
    access_token: req.user.google.accessToken,
    refresh_token: req.user.google.refreshToken,
  });

  var params = {
    auth: g.oauth2Client,
    id: req.query.playlistId,
  };

  g.youtube('playlists.delete', params)
  .then(function() {
    return res.status(204).send();
  }, function(error) {
    return res.status(500).send(error);
  });
};
