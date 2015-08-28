'use strict';

var crypto = require('crypto');
var config = require('../../config/environment');
var aws = require('aws-sdk');

var getHash = function(name) {
  return crypto.createHash('md5').update(new Date() + name).digest('hex');
};

exports.credential = function(req, res) {
  aws.config.update({ accessKeyId: config.aws.accessKeyId, secretAccessKey: config.aws.secretKey });
  aws.config.update({ region: 'us-east-1' , signatureVersion: 'v4' });

  var s3 = new aws.S3(); 
  var s3Params = { 
    Bucket: config.aws.s3Bucket, 
    Key: req.user.email + '/' + getHash(req.query.fileName),
    Expires: 300, 
    ContentType: req.query.fileType, 
    ACL: 'public-read'
  }; 
  var accessUrl = 'https://' + config.aws.s3Bucket + '.s3.amazonaws.com/' + s3Params.Key;

  s3.getSignedUrl('putObject', s3Params, function(err, url) { 
    if(err){ handleError(res, err); }
    return res.status(200).json({ signedUrl: url, accessUrl: accessUrl });
  });

};

exports.check = function(req, res) {
  var s3 = new aws.S3(); 
  var s3Params = {
    Bucket: config.aws.s3Bucket,
    Key: 'test@test.com/',
  };

  s3.headObject(s3Params, function(err, metadata) {
    console.log(err); 
    console.log(metadata); 
    return res.status(200).send(metadata);
  });
};


function handleError(res, err) {
  return res.status(500).send(err);
}
