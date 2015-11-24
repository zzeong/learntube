'use strict';

var _ = require('lodash');
var WContent = require('../../../models/watched-content.model');

require('mongoose').Promise = Promise;

exports.index = function (req, res) {
  var data = _.assign(req.query, { userId: req.params.id });

  WContent.find(data, function (err, classes) {
    if (err) { return res.status(500).send(err); }
    return res.status(200).json(classes);
  });
};

exports.create = function (req, res, next) {
  if (!req.body.playlistId) {
    return next(new Error('required parameter is not exist'));
  }

  var data = {
    userId: req.params.id,
    playlistId: req.body.playlistId
  };

  WContent.create(data)
  .then(function (classe) {
    return res.status(201).json(classe);
  })
  .catch(next);
};

exports.destroy = function (req, res) {
  WContent.findById(req.params.cid, function (err, classe) {
    if (err) { return res.status(500).send(err); }
    if (!classe) { return res.status(404).send(err); }

    classe.remove(function (err) {
      if (err) { return res.status(500).send(err); }
      return res.status(204).send();
    });
  });
};

