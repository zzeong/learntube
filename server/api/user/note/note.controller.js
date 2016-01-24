'use strict';

var _ = require('lodash');
var url = require('url');
var Note = require('../../../models/note.model');
var s3 = require('../../../components/s3');
var kutil = require('../../../components/util');

exports.index = function (req, res) {
  var data = _.assign(req.query, { userId: req.params.id });

  Note.find(data, function (err, notes) {
    if (err) { return res.status(500).send(err); }
    if (!notes) { return res.status(404).send('Not Found'); }

    return res.status(200).json(notes);
  });
};

exports.create = (req, res, next) => {
  var hash = kutil.getUniqueHash();
  var uploadPath = `/${req.user.email}/notes/${hash}`;

  s3.putFile(req.files.file.path, uploadPath, {
    'Content-Type': req.files.file.type,
    'x-amz-acl': 'public-read'
  })
  .then(() => {
    var uploadUrl = s3.client.url(uploadPath);
    console.log('[S3]:PUT saved to %s', uploadUrl);

    var note = new Note({
      userId: req.params.id,
      videoId: req.body.videoId,
      playlistId: req.body.playlistId,
      type: req.body.type,
      resourceType: req.files.file.headers['content-type'],
      url: uploadUrl
    });

    return note.save();
  })
  .then((note) => res.status(201).json(_.omit(note.toObject(), 'userId')))
  .catch(next);
};


exports.show = function (req, res) {
  Note.findById(req.params.nid, function (err, note) {
    if (err) { return res.status(500).send(err); }
    if (!note) { return res.status(404).send('Not Found'); }

    return res.status(200).json(note);
  });
};

exports.getContents = (req, res, next) => {
  Note.findById(req.params.nid).exec()
  .then((note) => {
    return s3.getFile(url.parse(note.url).pathname)
    .then((s3res) => {
      let entity = {
        _id: note._id,
        contents: ''
      };

      console.log('[S3]:GET', s3res.statusCode, s3res.headers);

      s3res.setEncoding('utf8');
      s3res.on('data', (chunked) => {
        entity.contents += chunked;
      });
      s3res.on('end', () => res.status(200).json(entity));
    });
  })
  .catch(next);
};

exports.update = function (req, res, next) {
  Note.findById(req.params.nid)
  .then((note) => {
    if (!note) { return res.status(404).send('Not Found'); }

    var uploadPath = url.parse(note.url).pathname;

    return s3.putFile(req.files.file.path, uploadPath, {
      'Content-Type': req.files.file.type,
      'x-amz-acl': 'public-read',
    })
    .then(() => {
      var uploadUrl = s3.client.url(uploadPath);
      console.log('[S3]:PUT saved to %s', uploadUrl);

      note.videoId = req.query.videoId || note.videoId;
      note.playlistId = req.query.playlistId || note.playlistId;
      note.type = req.query.type || note.type;

      return note.save();
    });
  })
  .then((note) => res.status(201).json(note))
  .catch(next);
};

exports.destroy = (req, res, next) => {
  Note.findById(req.params.nid)
  .then((note) => {
    if (!note) { return res.status(404).send('Not Found'); }
    let uploadPath = url.parse(note.url).pathname;
    return s3.deleteFile(uploadPath)
    .then((res) => {
      console.log('[S3]:DELETE', res.statusCode, res.headers);
      return note.remove();
    });
  })
  .then(() => res.status(204).send())
  .catch(next);
};

