/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /notes              ->  index
 * POST    /notes              ->  create
 * GET     /notes/:id          ->  show
 * PUT     /notes/:id          ->  update
 * DELETE  /notes/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var crypto = require('crypto');
var knox = require('knox');
var User = require('../user/user.model');
var Note = require('./note.model');

var awsClient = knox.createClient({
  key: process.env.AWSAccessKeyId,
  secret: process.env.AWSSecretKey,
  bucket: 'learntubebucket'
});


// Get list of notes
exports.index = function(req, res) {
};

// Get a single note
exports.show = function(req, res) {
};

// Creates a new note in the DB.
exports.create = function(req, res) {
  User.findOne({ email: req.body.params.email }, function (err, user) {
    if(err) { return handleError(res, err); }
    if(!user) { return res.status(404).send('Not Found'); }

    var p = req.body.params;

    var id = crypto.randomBytes(20).toString('hex');
    var hash = crypto.createHash('md5').update(id).digest('hex');
    var uploadedPath = '/' + user.email + '/' + hash;

    var reqToS3 = awsClient.put(uploadedPath, {
      'x-amz-acl': 'private',
      'Content-Length': Buffer.byteLength(p.note),
      'Content-Type': 'text/html'
    });

    reqToS3.on('response', function(resFromS3) {
      if(200 == resFromS3.statusCode) {
        console.log('saved to %s', reqToS3.url);
      }

      var note = {
        videoId: p.videoId,
        hash: hash,
        url: reqToS3.url
      };

      user.notes.push(note);
      user.save(function (err) {
        if(err) { return handleError(res, err); }
        return res.status(201).json({ status: 'success' });
      });
    });

    reqToS3.end(req.body.params.note);
  });
};

// Updates an existing note in the DB.
exports.update = function(req, res) {
};

// Deletes a note from the DB.
exports.destroy = function(req, res) {
};

function handleError(res, err) {
  return res.status(500).send(err);
}
