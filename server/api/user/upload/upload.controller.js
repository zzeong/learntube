'use strict';

var _ = require('lodash');
var Upload = require('../../../models/upload.model');
var mongoose = require('mongoose');
var config = require('../../../config/environment');
var knox = require('knox');
var url = require('url');

var awsClient = knox.createClient({
  key: config.aws.accessKeyId,
  secret: config.aws.secretKey,
  bucket: config.aws.s3Bucket
});

mongoose.Promise = Promise;

exports.index = (req, res, next) => {
  var query = _.assign({ userId: req.params.id }, req.query);

  Upload.find(query).exec()
  .then((uploads) => res.status(200).json(uploads))
  .catch(next);
};

exports.create = (req, res, next) => {
  var query = _.assign({ userId: req.params.id }, req.body);

  Upload.create(query)
  .then((upload) => res.status(201).json(upload))
  .catch(next);
};

exports.destroy = (req, res, next) => {
  Upload.findById(req.params.uid).exec()
  .then((upload) => {
    if (!upload) { throw new Error('not found'); }

    awsClient.del(url.parse(upload.url).pathname)
    .on('response', function (response) {
      console.log('[S3]:DELETE', response.statusCode, response.headers);
      upload.remove()
      .then(() => res.status(204).send())
      .catch(next);
    })
    .end();
  })
  .catch(next);
};
