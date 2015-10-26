'use strict';

var _ = require('lodash');
var Class = require('../../../../models/class.model');


exports.index = function (req, res) {
};

exports.show = function (req, res) {
};

exports.create = function (req, res) {
  Class.findById(req.params.cid, function (err, classe) {
    if (err) { return res.status(500).send(err); }
    if (!classe) { return res.status(404).send(err); }

    classe.lectures.push({ videoId: req.body.videoId });
    classe.save(function (saveErr, savedClass) {
      if (err) { return res.status(500).send(err); }
      return res.status(201).json(savedClass);
    });
  });
};

exports.update = function (req, res) {
};

exports.destroy = function (req, res) {
};

