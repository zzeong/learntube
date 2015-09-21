'use strict';

var _ = require('lodash');
var User = require('../user.model');
var Upload = require('./upload.model');

exports.index = function(req, res) {
  var query = _.assign({ userId: req.params.id }, req.query);

  Upload.find(query, function(err, uploads) {
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

    Upload.findOne({
      userId: req.params.id,
      playlistId: req.body.playlistId
    }, function(err, upload) {
      if(err) { return res.status(500).send(err); }
      if(!upload) {
        upload = new Upload({
          userId: req.params.id,
          playlistId: req.body.playlistId,
          s3Url: req.body.url,
        });

        pushAndSave(upload, 'lectures', req);
        return;
      }

      pushAndSave(upload, 'lectures', req);
    });
  });
};

