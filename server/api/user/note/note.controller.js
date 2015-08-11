/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /notes              ->  index
 * POST    /notes              ->  create
 * GET     /notes/:nid          ->  show
 * PUT     /notes/:nid          ->  update
 * DELETE  /notes/:nid          ->  destroy
 */

'use strict';

var _ = require('lodash');
var crypto = require('crypto');
var knox = require('knox');
var User = require('../user.model');
var Note = require('./note.model');

var awsClient = knox.createClient({
  key: process.env.AWSAccessKeyId,
  secret: process.env.AWSSecretKey,
  bucket: 'learntubebucket'
});

var createRandomHash = function() {
  var id = crypto.randomBytes(20).toString('hex');
  return crypto.createHash('md5').update(id).digest('hex');
};


// Get list of notes
exports.index = function(req, res) {
};

// Get a single note
exports.show = function(req, res) {
  User.findById(req.params.id, function(err, user) {
    if(err) { return handleError(res, err); }
    if(!user) { return res.status(404).send('Not Found'); }

    var noteDoc = user.notes.id(req.params.nid);

    awsClient.get(noteDoc.s3Path).on('response', function(resFromS3){
      console.log('[S3]:GET ' + resFromS3.statusCode);
      console.log('[S3]:GET ' + resFromS3.headers);
      resFromS3.setEncoding('utf8');
      resFromS3.on('data', function(chunk){
        return res.status(200).json({
          message: 'gotten',
          contents: chunk
        });
      });
    }).end();

  });
};

// Creates a new note in the DB.
exports.create = function(req, res) {
  User.findById(req.params.id, function(err, user) {
    if(err) { return handleError(res, err); }
    if(!user) { return res.status(404).send('Not Found'); }

    var hash = createRandomHash();
    var uploadedPath = '/' + user.email + '/' + hash;

    var reqToS3 = awsClient.put(uploadedPath, {
      'x-amz-acl': 'private',
      'Content-Length': Buffer.byteLength(req.body.contents),
      'Content-Type': 'text/html'
    });

    reqToS3.on('response', function(resFromS3) {
      if(200 === +resFromS3.statusCode) {
        console.log('[S3]:PUT saved to %s', reqToS3.url);
      }

      var note = {
        videoId: req.body.videoId,
        hash: hash,
        url: reqToS3.url,
        s3Path: uploadedPath
      };

      user.notes.push(note);
      var nid = _.last(user.notes)._id;
      user.save(function (err) {
        if(err) { return handleError(res, err); }
        return res.status(201).json({
          nid: nid,
          message: 'saved'
        });
      });
    });

    reqToS3.end(req.body.contents);
  });
};

// Updates an existing note in the DB.
exports.update = function(req, res) {
};

// Deletes a note from the DB.
exports.destroy = function(req, res) {
  User.findById(req.params.id, function (err, user) {
    if(err) { return handleError(res, err); }
    if(!user) { return res.status(404).send('Not Found'); }

    var noteDoc = user.notes.id(req.params.nid);

    awsClient.del(noteDoc.s3Path).on('response', function(resFromS3){
      console.log('[S3]:DELETE ' + res.statusCode);
      console.log('[S3]:DELETE ' + res.headers);
      user.notes.id(req.params.nid).remove();
      user.save(function (err) {
        if(err) { return handleError(res, err); }
        return res.status(200).json({ message: 'removed' });
      });
    }).end();

  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}
