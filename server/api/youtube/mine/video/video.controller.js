'use strict';

var g = require('../../../../components/google-api');
var config = require('../../../../config/environment');
var gapiHelper = require('../youtube-mine-service');

exports.index = function (req, res, next) {
  var body = {};

  g.youtube('channels.list', {
    part: 'contentDetails',
    mine: true,
    fields: 'items(contentDetails)',
  })
  .then(function (response) {
    var params = {
      part: 'id,snippet,status',
      playlistId: response.items[0].contentDetails.relatedPlaylists.uploads,
      maxResults: config.google.maxResults,
      fields: 'items(id,snippet,status),nextPageToken',
    };
    return g.youtube('playlistItems.list', params);
  })
  .then(function (response) {
    body = gapiHelper.createBodyForList(response);
    if (req.query.withDuration) {
      return gapiHelper.applyAdditional(g, body.items);
    }
    return Promise.resolve();
  })
  .then(function () {
    return res.status(200).json(body);
  })
  .catch(next);
};
