'use strict';

var _ = require('lodash');
var Class = require('../../../models/class.model');

require('mongoose').Promise = require('promise');

exports.index = function (req, res) {
  var data = _.assign(req.query, { userId: req.params.id });

  Class.find(data, function (err, classes) {
    if (err) { return res.status(500).send(err); }
    return res.status(200).json(classes);
  });
};

exports.create = function (req, res, next) {
  var data = {
    userId: req.params.id,
    playlistId: req.body.playlistId
  };

  Class.create(data)
  .then(function (classe) {
    return res.status(201).json(classe);
  })
  .catch(function (err) {
    console.error(err.stack);
    var error = new Error();
    if (err.code === 11000) {
      error.message = 'item already exists';
    }
    return next(error);
  });
};

exports.destroy = function (req, res) {
  Class.findById(req.params.cid, function (err, classe) {
    if (err) { return res.status(500).send(err); }
    if (!classe) { return res.status(404).send(err); }

    classe.remove(function (err) {
      if (err) { return res.status(500).send(err); }
      return res.status(204).send();
    });
  });
};

