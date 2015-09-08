'use strict';

var Note = require('../user/note/note.model');
var knox = require('knox');
var config = require('../../config/environment');
var Promise = require('promise');

var awsClient = knox.createClient({
  key: config.aws.accessKeyId,
  secret: config.aws.secretKey,
  bucket: config.aws.s3Bucket
});

var getDataFromS3 = function(path) {
  return new Promise(function(resolve) {
    awsClient.get(path).on('response', function(resFromS3){
      console.log('[S3]:GET', resFromS3.statusCode, resFromS3.headers);
      resFromS3.setEncoding('utf8');
      resFromS3.on('data', resolve);
    }).end();
  });
};


exports.index = function(req, res) {
  Note.find(req.query)
  .populate({
    path: 'userId',
    select: 'name google.image.url' 
  })
  .exec(function(err, notes) {
    if(err) { return res.status(500).send(err); } 
    if(!notes.length) { return res.status(404).send('Not Found'); }

    Promise.all(notes.map(function(note) {
      return getDataFromS3(note.s3Path).then(function(contents) {
        return {
          _id: note._id,
          userId: note.userId,
          contents: contents
        }; 
      }); 
    }))
    .then(function(results) {
      return res.status(200).json(results); 
    });
  });
};
