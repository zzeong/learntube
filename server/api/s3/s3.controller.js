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
    Key: req.user.email + '/uploads/' + getHash(req.query.fileName),
    Expires: 300, 
    ContentType: req.query.fileType, 
    ACL: 'public-read'
  }; 
  var accessUrl = s3.endpoint.href + config.aws.s3Bucket + '/' + s3Params.Key;

  s3.getSignedUrl('putObject', s3Params, function(err, url) { 
    if(err){ return res.status(500).send(err); }
    return res.status(200).json({ signedUrl: url, accessUrl: accessUrl });
  });

};

