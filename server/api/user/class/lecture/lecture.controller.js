/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /lectures              ->  index
 * POST    /lectures              ->  create
 * GET     /lectures/:lid          ->  show
 * PUT     /lectures/:lid          ->  update
 * DELETE  /lectures/:lid          ->  destroy
 */

'use strict';

var _ = require('lodash');
var User = require('../../user.model');
var Class = require('../class.model');
var Lecture = require('./lecture.model');


// Get list of lectures
exports.index = function(req, res) {
};

// Get a single lecture
exports.show = function(req, res) {
};

// Creates a new lecture in the DB.
exports.create = function(req, res) {
  Class.findById(req.params.cid, function(err, classe) {
    if(err){ return res.status(500).send(err); }
    if(!classe) { return res.status(404).send(err); }

    classe.lectures.push({ videoId: req.body.videoId });
    classe.save(function(saveErr, savedClass) {
      if(err){ return res.status(500).send(err); }
      return res.status(201).json(savedClass);
    });
  });
};

// Updates an existing lecture in the DB.
exports.update = function(req, res) {
};

// Deletes a lecture from the DB.
exports.destroy = function(req, res) {
};

