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
var Promise = require('promise');
var config = require('../../../config/environment');

var awsClient = knox.createClient({
  key: config.aws.accessKeyId,
  secret: config.aws.secretKey,
  bucket: config.aws.s3Bucket
});

var createRandomHash = function() {
  var id = crypto.randomBytes(20).toString('hex');
  return crypto.createHash('md5').update(id).digest('hex');
};

var getDataFromS3 = function(path) {
  return new Promise(function(resolve) {
    awsClient.get(path).on('response', function(resFromS3){
      console.log('[S3]:GET', resFromS3.statusCode, resFromS3.headers);
      resFromS3.setEncoding('utf8');
      resFromS3.on('data', resolve);
    }).end();
  });
};


// Get list of NoteSchema
exports.index = function(req, res) {
  var data = _.assign(req.query, { userId: req.params.id });

  Note.find(data, function(err, notes) {
    if(err) { return res.status(500).send(err); }

    Promise.all(notes.map(function(note) {
      return getDataFromS3(note.s3Path).then(function(contents) {
        return {
          _id: note._id,
          contents: contents
        };
      });
    })).then(function(results) {
      return res.status(200).json(results);
    });

  });
};

exports.meta = function(req, res) {
  Note.find(req.query, function(err, notes) {
    if(err) { return res.status(500).send(err); }
    if(!notes) { return res.status(404).send('Not Found'); }
    
    return res.status(200).json(notes);
  });
};


// Creates a new note in the DB.
exports.create = function(req, res) {
  User.findById(req.params.id, function(err, user) {
    if(err) { return res.status(500).send(err); }
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

      var note = new Note({
        userId: req.params.id,
        videoId: req.body.videoId,
        playlistId: req.body.playlistId,
        hash: hash,
        url: reqToS3.url,
        s3Path: uploadedPath
      });

      note.save(function(err){
        if(err) { return res.status(500).send(err); }
        return res.status(201).json({ _id: note._id });
      });
    });

    reqToS3.end(req.body.contents);
  });
};



// Get a single note
exports.show = function(req, res) {

  Note.findById(req.params.nid, function(err, note) {
    if(err) { return res.status(500).send(err); }
    if(!note) { return res.status(404).send('Not Found'); }


    awsClient.get(note.s3Path).on('response', function(resFromS3){
      console.log('[S3]:GET', resFromS3.statusCode, resFromS3.headers);
      resFromS3.setEncoding('utf8');
      resFromS3.on('data', function(chunk){
        return res.status(200).json({
          _id: note._id,
          contents: chunk
        });
      });
    }).end();

  });
};



// Updates an existing note in the DB.
exports.update = function(req, res) {
  Note.findById(req.params.nid, function(err, note) {
    if(err) { return res.status(500).send(err); }
    if(!note) { return res.status(404).send('Not Found'); }

    var reqToS3 = awsClient.put(note.s3Path, {
      'x-amz-acl': 'private',
      'Content-Length': Buffer.byteLength(req.body.contents),
      'Content-Type': 'text/html'
    });

    reqToS3.on('response', function(resFromS3) {
      if(200 === +resFromS3.statusCode) {
        console.log('[S3]:PUT saved to %s', reqToS3.url);
      }

      return res.status(200).json({ _id: note._id });
    });

    reqToS3.end(req.body.contents);
  });
};





// Deletes a note from the DB.
exports.destroy = function(req, res) {
  Note.findById(req.params.nid, function (err, note) {
    if(err) { return res.status(500).send(err); }
    if(!note) { return note.status(404).send('Not Found'); }

    awsClient.del(note.s3Path).on('response', function(resFromS3){
      console.log('[S3]:DELETE', res.statusCode, res.headers);
      var removedId = note._id;
      note.remove(function(err){
        if(err) { return res.status(500).send(err); }
        return res.status(200).json({ _id: removedId });
      });

    }).end();
  });
};

