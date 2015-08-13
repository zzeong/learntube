/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /classes              ->  index
 * POST    /classes              ->  create
 * GET     /classes/:cid          ->  show
 * PUT     /classes/:cid          ->  update
 * DELETE  /classes/:cid          ->  destroy
 */

'use strict';

var _ = require('lodash');
var User = require('../user.model');
var Class = require('./class.model');


// Get list of classes
exports.index = function(req, res) {
  Class.find(function (err, classes) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(classes);
  });
};

// Get a single classe
exports.show = function(req, res) {
};

// Creates a new classe in the DB.
exports.create = function(req, res) {
  var data = {
    userId: req.params.id, 
    playlistId: req.body.playlistId
  };

  Class.findOne(data, function(err, classe) {
    if(err) { return handleError(res, err) }
    if(!classe) {
      return Class.create(data, function(createErr, createdClass) {
        console.log('createdClass' + createdClass);
        if(createErr) { return handleError(res, createErr); }
        return res.status(201).json(createdClass);
      }); 
    }
    return res.status(200).json(classe);
  });
};

// Updates an existing classe in the DB.
exports.update = function(req, res) {
};

// Deletes a classe from the DB.
exports.destroy = function(req, res) {
  Class.findById(req.params.cid, function (err, classe) {
    if(err) { return handleError(res, err); }
    if(!classe) { return res.status(404).send(err); }

    classe.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send();
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}
