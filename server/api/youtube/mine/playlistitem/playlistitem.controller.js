'use strict';

var _ = require('lodash');
var g = require('../../../../components/google-api');
var config = require('../../../../config/environment');
var Promise = require('promise');


exports.index = function(req, res) {
  g.oauth2Client.setCredentials({
    access_token: req.user.google.accessToken,
    refresh_token: req.user.google.refreshToken,
  });

  var params = {
    auth: g.oauth2Client,
    part: 'id,snippet,status',
    playlistId: req.query.playlistId,
    maxResults: config.google.maxResults,
    fields: 'items(id,snippet,status),nextPageToken',
  };

  g.youtube('playlistItems.list', params)
  .then(function(response) {
    var resBody = {
      pageToken: response.nextPageToken,
      items: response.items
    };

    if(req.query.withDuration) {
      g.youtube('videos.list', {
        auth: g.oauth2Client,
        part: 'contentDetails',
        id: resBody.items.map(function(item) {
          return item.snippet.resourceId.videoId;
        }).join(','),
        fields: 'items(contentDetails(duration))',
      })
      .then(function(response) {
        resBody.items.forEach(function(item, i) {
          item.contentDetails = response.items[i].contentDetails;
        });
        return res.status(200).json(resBody);
      }, function(error) {
        return res.status(500).send(error); 
      });

      return;
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


  g.youtube('playlistItems.insert', params)
  .then(function(item) {
    if(req.query.withDuration) {
      g.youtube('videos.list', {
        auth: g.oauth2Client,
        part: 'contentDetails',
        id: item.snippet.resourceId.videoId,
        fields: 'items(contentDetails(duration))',
      })
      .then(function(response) {
        item.contentDetails = response.items[0].contentDetails;
        return res.status(201).json(item);
      }, function(error) {
        return res.status(500).send(error); 
      });

      return;
    }

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
    id: req.query.playlistItemId,
  }; 

  g.youtube('playlistItems.delete', params)
  .then(function() {
    return res.status(204).send();
  }, function(error) {
    return res.status(500).send(error); 
  });
};
