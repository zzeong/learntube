'use strict';

var _ = require('lodash');
var User = require('../user.model');
var Upload = require('./upload.model');
var mongoose = require('mongoose');

mongoose.Promise = require('promise');


var handleError = function(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}


exports.index = function(req, res) {
  var query = _.assign({ userId: req.params.id }, req.query);

  Upload.find(query).exec()
  .then(function(uploads) {
    if(!uploads.length) { return res.status(404).send('Not Found'); }
    return res.status(200).json(uploads);
  })
  .catch(handleError(res));
};

exports.create = function(req, res) {
  User.findById(req.params.id).exec()
  .then(function(user) {
    if(!user) { return res.status(404).send('Not Found'); }

    var query = {
      userId: req.params.id,
      playlistId: req.body.playlistId
    };

    return Upload.findOneAndUpdate(query, {
      $setOnInsert: query
    }, {
      new: true,
      upsert: true
    })
    .exec();
  })
  .then(function(upload) {
    upload.lectures.push({
      videoId: req.body.videoId, 
      url: req.body.url
    });
    return upload.save();
  })
  .then(function(upload) {
    return res.status(201).json(upload); 
  })
  .catch(handleError(res));
};

