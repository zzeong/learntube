'use strict';

var _ = require('lodash');
var g = require('../../../../components/google-api');
var config = require('../../../../config/environment');
var gapiHelper = require('../youtube-mine-service');
var Class = require('../../../../models/class.model');

require('mongoose').Promise = Promise;

exports.index = function (req, res, next) {
  var body = {};

  var defaults = {
    part: 'id,snippet,status',
    maxResults: config.google.maxResults,
    fields: 'items(id,snippet,status),nextPageToken',
  };

  var params = _.assign(defaults, req.query);
  if (!_.has(req.query, 'id')) { params.mine = true; }

  g.youtube('playlists.list', params)
  .then(function (response) {
    body = gapiHelper.createBodyForList(response);
    body.items = body.items.map(function (item) {
      return {
        thumbnailUrl: item.snippet.thumbnails.medium.url,
        title: item.snippet.title,
        description: item.snippet.description,
        id: item.id,
      };
    });

    var promises = body.items.map(function (item) {
      return Class.findOne({ playlistId: item.id }).exec()
      .then(function (classe) {
        if (!classe) {
          item.rate = 0;
          item.views = 0; // this is UNTRUSTORTHY value. it will be repalce when a crawler is created.
          return Promise.resolve();
        }
        item.rate = _.has(classe.toObject(), 'rate') ? classe.rate : 0;
        item.views = classe.views;
        return Promise.resolve();
      });
    });

    return Promise.all(promises);
  })
  .then(function () {
    res.status(200).json(body);
  })
  .catch(next);
};

exports.create = (req, res, next) => {
  let body = {};
  let params = _.assign({
    part: 'snippet,status',
    fields: 'id,snippet,status',
  }, _.pick(req.body, 'resource'));

  g.youtube('playlists.insert', params)
  .then((item) => {
    let doc = {
      categorySlug: req.body.extras.categorySlug,
      playlistId: item.id,
      channelId: item.snippet.channelId,
      rate: 0,
      views: 0,
    };

    body = {
      thumbnailUrl: item.snippet.thumbnails.medium.url,
      title: item.snippet.title,
      description: item.snippet.description,
      id: item.id,
      rate: doc.rate,
      views: doc.views,
    };

    return Class.create(doc);
  })
  .then(() => { res.status(201).json(body); })
  .catch(next);
};

exports.update = (req, res, next) => {
  let params = _.assign({ part: 'snippet' }, _.pick(req.body, 'resource'));
  let body = null;

  g.youtube('playlists.update', params)
  .then((item) => {
    let query = { playlistId: item.id };
    body = {
      thumbnailUrl: item.snippet.thumbnails.medium.url,
      title: item.snippet.title,
      description: item.snippet.description,
      id: item.id,
    };
    return Class.findOne(query).exec();
  })
  .then((classe) => {
    body.rate = classe ? classe.rate : 0;
    body.views = classe ? classe.views : 0;
    res.status(200).json(body);
  })
  .catch(next);
};

exports.destroy = (req, res, next) => {
  let pid = req.query.playlistId;
  let params = { id: pid };

  g.youtube('playlists.delete', params)
  .then(() => Class.findOne({ playlistId: pid }).exec())
  .then(() => { res.status(204).send(); })
  .catch(next);
};
