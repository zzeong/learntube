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

var awsClient = knox.createClient({
  key: process.env.AWSAccessKeyId,
  secret: process.env.AWSSecretKey,
  bucket: 'learntubebucket'
});

var createRandomHash = function() {
  var id = crypto.randomBytes(20).toString('hex');
  return crypto.createHash('md5').update(id).digest('hex');
};

var getDataFromS3 = function(path) {
  return new Promise(function(resolve) {
    awsClient.get(path).on('response', function(resFromS3){
      console.log('[S3]:GET ' + resFromS3.statusCode);
      console.log('[S3]:GET ' + resFromS3.headers);
      resFromS3.setEncoding('utf8');
      resFromS3.on('data', resolve);
    }).end();
  });
};


// Get list of NoteSchema
exports.index = function(req, res) {
  var data = _.assign(req.query, { userId: req.params.id });

  Note.find(data, function(err, notes) {
    if(err) { return handleError(res, err); } 
    //var note = notes[0];

    Promise.all(notes.map(function(note) {
      return getDataFromS3(note.s3Path).then(function(contents) {
        return {
          _id: note._id,
          message: 'gotten',
          contents: contents
        };
      });
    })).then(function(results) {
      return res.status(200).json(results);  
    });

  });
};


// Creates a new note in the DB.
// req = 요청 api / res = 받아온 정보. 즉 우리가 서버에 던질 것. 맞나?
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

      var noteObj = new Note({
        userId: req.params.id,
        videoId: req.body.videoId,
        hash: hash,
        url: reqToS3.url,
        s3Path: uploadedPath
      });

      // push대신 save method
      noteObj.save(function(err){
        if(err){return handleError(res, err);}
        return res.status(201).json(noteObj);
      });
    });

    reqToS3.end(req.body.contents);
  });
};


exports.query = function(req, res) {
  Note.find({ userId: req.params.id, videoId: req.query.videoId }, function(err, notes) {
    if(err) { return handleError(res, err); } 
    var note = notes[0];

    awsClient.get(note.s3Path).on('response', function(resFromS3){
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




// Get a single note
exports.show = function(req, res) {

  // 노트를 찾는다
  Note.findById(req.params.nid, function(err, note) {
    // 에러처리
    if(err) { return handleError(res, err); }
    if(!note) { return res.status(404).send('Not Found'); }

    // noteDoc을 만들필요가 없어서 주석처리. 
    // var noteDoc = Note.id(res.note.nid);

    awsClient.get(note.s3Path).on('response', function(resFromS3){
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




// Updates an existing note in the DB.
exports.update = function(req, res) {

};





// Deletes a note from the DB.
exports.destroy = function(req, res) {
  Note.findById(req.params.nid, function (err, note) {
    if(err) { return handleError(res, err); }
    if(!note) { return note.status(404).send('Not Found'); }

    awsClient.del(note.s3Path).on('response', function(resFromS3){
      console.log('[S3]:DELETE ' + res.statusCode);
      console.log('[S3]:DELETE ' + res.headers);
      note.remove(function(err){
        if(err){ return handleError(res,err); }
        return res.status(200).json({message: 'removed' });
      });

      /*      Note.save(function (err) {
              if(err) { return handleError(res, err); }
              return res.status(200).json({ message: 'removed' });
              });*/

    }).end();

  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}
