'use strict';

var _ = require('lodash');
var g = require('../../../../components/google-api');
var config = require('../../../../config/environment');
var gapiHelper = require('../youtube-mine-service');

function figureIdOutAndDelete(params) {
  return g.youtube('playlistItems.list', params)
  .then(function (res) {
    return g.youtube('playlistItems.delete', {
      id: res.items[0].id
    });
  });
}

function deleteAllPlaylistItems(params) {
  var paramsUnit = {
    part: 'id',
    playlistId: params.playlistId,
    videoId: params.videoId.shift()
  };

  return new Promise(function (resolve) {
    (function recursive(p) {
      figureIdOutAndDelete(p)
      .then(function () {
        var videoId = params.videoId.shift();
        if (!videoId) { return resolve(); }

        p.videoId = videoId;
        recursive(p);
      });
    })(paramsUnit);
  });
}

exports.index = (req, res, next) => {
  var body = {};
  var params = _.assign({
    part: 'id,snippet,status',
    fields: 'items(id,snippet,status),nextPageToken',
    maxResults: config.google.maxResults,
  }, _.omit(req.query, 'withDuration'));

  g.youtube('playlistItems.list', params)
  .then((response) => {
    body = {
      pageToken: response.nextPageToken,
      items: response.items
    };

    if (req.query.withDuration) {
      return gapiHelper.applyAdditional(g, body.items);
    }
    return Promise.resolve();
  })
  .then(() => res.status(200).json(body))
  .catch(next);
};

exports.create = function (req, res, next) {
  var body = {};
  var params = _.assign({
    part: 'snippet,status',
    fields: 'id,snippet,status',
  }, req.body);

  g.youtube('playlistItems.insert', params)
  .then(function (item) {
    body = item;
    if (req.query.withDuration) {
      return gapiHelper.applyAdditional(g, body);
    }
    return Promise.resolve();
  })
  .then(function () {
    return res.status(201).json(body);
  })
  .catch(next);
};

exports.destroy = function (req, res, next) {
  deleteAllPlaylistItems({
    playlistId: req.query.playlistId,
    videoId: req.query.videoId.split(',')
  })
  .then(function () {
    return res.status(204).send();
  })
  .catch(next);
};
