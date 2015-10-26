'use strict';

var _ = require('lodash');
var User = require('../../../models/user.model');
var Class = require('../../../models/class.model');

exports.index = function (req, res) {
  var data = _.assign(req.query, { userId: req.params.id });

  Class.find(data, function (err, classes) {
    if (err) { return res.status(500).send(err); }
    return res.status(200).json(classes);
  });
};

exports.show = function (req, res) {
};

exports.create = function (req, res) {
  var data = {
    userId: req.params.id,
    playlistId: req.body.playlistId
  };

  Class.findOne(data, function (err, classe) {
    if (err) { return res.status(500).send(err); }
    if (!classe) {
      return Class.create(data, function (createErr, createdClass) {
        if (createErr) { return res.status(500).send(createErr); }
        return res.status(201).json(createdClass);
      });
    }
    return res.status(200).json(classe);
  });
};

exports.update = function (req, res) {
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

