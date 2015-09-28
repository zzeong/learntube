'use strict';

var User = require('../../user.model');
var Upload = require('../upload.model');
var config = require('../../../../config/environment');
var knox = require('knox');
var url = require('url');

var awsClient = knox.createClient({
  key: config.aws.accessKeyId,
  secret: config.aws.secretKey,
  bucket: config.aws.s3Bucket
});

exports.destroy = function (req, res) {
  Upload.findById(req.params.uid, function (err, upload) {
    if (err) { return res.status(500).send(); }
    if (!upload) { return res.status(404).send('Not Found'); }

    var lecture = upload.lectures.id(req.params.lid);

    awsClient.del(url.parse(lecture.url).pathname).on('response', function (response) {
      console.log('[S3]:DELETE', response.statusCode, response.headers);
      lecture.remove();
      upload.save(function (err) {
        if (err) { return res.status(500).send(); }
        return res.status(204).send();
      });
    }).end();
  });
};
