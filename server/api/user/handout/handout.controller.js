'use strict';

var _ = require('lodash');
var Handout = require('../../../models/handout.model');
var mongoose = require('mongoose');
var knox = require('knox');
var url = require('url');

var awsClient = knox.createClient({
  key: process.env.AWS_ACCESSKEY_ID,
  secret: process.env.AWS_SECRETKEY,
  bucket: process.env.AWS_S3_BUCKET
});

mongoose.Promise = Promise;

exports.index = (req, res, next) => {
  var query = _.assign({ _uploader: req.params.id }, req.query);

  Handout.find(query).exec()
  .then((handouts) => res.status(200).json(handouts))
  .catch(next);
};

exports.create = (req, res, next) => {
  var query = _.assign({ _uploader: req.params.id }, req.body);

  Handout.create(query)
  .then((handout) => res.status(201).json(handout))
  .catch(next);
};

exports.destroy = (req, res, next) => {
  Handout.findById(req.params.uid).exec()
  .then((handout) => {
    if (!handout) { throw new Error('not found'); }

    awsClient.del(url.parse(handout.url).pathname)
    .on('response', function (response) {
      console.log('[S3]:DELETE', response.statusCode, response.headers);
      handout.remove()
      .then(() => res.status(204).send())
      .catch(next);
    })
    .end();
  })
  .catch(next);
};
