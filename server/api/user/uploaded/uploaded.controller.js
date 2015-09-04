'use strict';

var _ = require('lodash');
var User = require('../user.model');
var Uploaded = require('./uploaded.model');

exports.index = function(req, res) {
  var query = _.assign({ userId: req.params.id }, req.query);

  Uploaded.find(query, function(err, uploads) {
    if(err) { return res.status(500).send(err); }
    if(!uploads.length) { return res.status(404).send('Not Found'); }
    
    return res.status(200).json(uploads);
  });
};

exports.create = function(req, res) {
  var pushAndSave = function(model, sub, request) {
    model[sub].push({
      videoId: request.body.videoId, 
      s3Url: request.body.url
    }); 

    return model.save(function(err) {
      if(err) { return res.status(500).send(err); }
      return res.status(201).json(model);
    });    
  };

  User.findById(req.params.id, function(err, user) {
    if(err) { return res.status(500).send(err); }
    if(!user) { return res.status(404).send('Not Found'); }

    Uploaded.findOne({
      userId: req.params.id,
      playlistId: req.body.playlistId
    }, function(err, uploaded) {
      if(err) { return res.status(500).send(err); }
      if(!uploaded) {
        uploaded = new Uploaded({
          userId: req.params.id,
          playlistId: req.body.playlistId,
          s3Url: req.body.url,
        });

        pushAndSave(uploaded, 'lectures', req);
        return;
      }

      pushAndSave(uploaded, 'lectures', req);
    });
  });
};

