'use strict';

var _ = require('lodash');
var google = require('googleapis');
var youtube = google.youtube('v3');
var Promise = require('promise');
var config = require('../../../config/environment');

var getList = function(req) {
  return new Promise(function(resolve, reject) {
    var list = [];

    (function recurse(nextToken) {
      youtube.playlistItems.list({
        auth: config.google.serverKey,
        part: 'snippet,status',
        playlistId: req.query.playlistId,
        maxResults: req.query.max || 50,
        pageToken: nextToken,
        fields: 'items(contentDetails,snippet,status),nextPageToken',
      }, function(err, response) {
        if(err) { return reject(err); }

        list = list.concat(response.items);
        if(typeof response.nextPageToken === 'undefined') {
          return resolve(list);
        }
        recurse(response.nextPageToken);
      });
    })();
  });
};


exports.index = function(req, res) {
  getList(req).then(function(list) {
    var joinedId = list.map(function(lecture) {
      return lecture.snippet.resourceId.videoId;
    }).join(',');

    youtube.videos.list({
      auth: config.google.serverKey,
      part: 'contentDetails',
      id: joinedId,
      fields: 'items(contentDetails(duration))',
    }, function(err, response) {
      list.forEach(function(item, i) {
        _.assign(item, response.items[i]);
      });
      return res.status(200).json(list);
    }); 
  }, function(err) {
    return handleError(res, err);
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}
