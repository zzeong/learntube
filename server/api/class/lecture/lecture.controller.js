'use strict';

var _ = require('lodash');
var Upload = require('../../user/upload/upload.model');
var config = require('../../../config/environment');
var knox = require('knox');
var url = require('url');
var fs = require('fs');

var s3 = knox.createClient({
  key: config.aws.accessKeyId,
  secret: config.aws.secretKey,
  bucket: config.aws.s3Bucket
});


var handleError = function(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

var removeFile = function(path) {
  fs.unlink(path, function() {
    console.log('Successfully deleted %s', path);
  }); 
};

var streamFile = function(res, path) {
  return function() {
    var readStream = fs.createReadStream(path);
    readStream.pipe(res);
    readStream.on('end', function() {
      removeFile(path); 
    });
  };
};

exports.getHandout = function(req, res) {
  Upload.findOne({ playlistId: req.params.pid }).exec()
  .then(function(upload) {
    var lecture = upload.lectures.filter(function(lecture) {
      return lecture.videoId === req.params.vid; 
    });

    if(!lecture.length) { return res.status(404).send('Not found'); }
    lecture = lecture[0];

    var filePath = '.tmp/' + lecture.fileName;
    var writeStream = fs.createWriteStream(filePath);
    var s3Path = url.parse(lecture.url).pathname;

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename=' + lecture.fileName);

    s3.getFile(s3Path.substring(s3Path.indexOf('/', 1)), function(error, response) {
      if(error) { res.status(500).send(error); }

      response.pipe(writeStream);
      response.on('end', streamFile(res, filePath));
    });
  })
  .catch(handleError(res));
};
