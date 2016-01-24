'use strict';

var _ = require('lodash');
var mongoose = require('mongoose');
var Handout = require('../../../models/handout.model');
var s3 = require('../../../components/s3');
var kutil = require('../../../components/util');

mongoose.Promise = Promise;

exports.index = (req, res, next) => {
  var query = _.assign({ _uploader: req.params.id }, req.query);

  Handout.find(query).exec()
  .then((handouts) => {
    if (_.isEmpty(handouts)) { return res.status(404).json({ message: 'no resource' }); }
    res.status(200).json(handouts);
  })
  .catch(next);
};

exports.create = (req, res, next) => {
  let file = req.files.file;
  let uploadPath = createPath(req.user.email);

  s3.putFile(file.path, uploadPath, {
    'Content-Type': file.type,
    'x-amz-acl': 'public-read'
  })
  .then((s3res) => {
    console.log('[S3]:PUT', s3res.statusCode, s3res.headers);
    console.log('[S3]:PUT saved to %s', s3.client.url(uploadPath));

    let doc = _(req.body)
    .pick(['playlistId', 'videoId'])
    .assign({
      _uploader: req.params.id,
      fileName: file.name,
      s3Path: uploadPath
    })
    .value();

    return Handout.create(doc);
  })
  .then((handout) => res.status(201).json(handout))
  .catch(next);

  function createPath(prefix) {
    let hash = kutil.getUniqueHash();
    return `/${prefix}/handouts/${hash}`;
  }
};

exports.destroy = (req, res, next) => {
  Handout.findById(req.params.hid).exec()
  .then((handout) => {
    if (!handout) { return res.status(404).json({ message: 'no resource' }); }

    return s3.deleteFile(handout.s3Path)
    .then((res) => {
      console.log('[S3]:DELETE', res.statusCode, res.headers);
      return handout.remove();
    });
  })
  .then(() => res.status(204).send())
  .catch(next);
};

