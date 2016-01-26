'use strict';

const _ = require('lodash');
const url = require('url');
const Note = require('../../../models/note.model');
const s3 = require('../../../components/s3');
const kutil = require('../../../components/util');

function index(req, res, next) {
  let data = _.assign(req.query, { userId: req.params.id });

  Note.find(data).exec()
  .then((notes) => res.status(200).json(notes))
  .catch(next);
}

function create(req, res, next) {
  let hash = kutil.getUniqueHash();
  let uploadPath = `/${req.user.email}/notes/${hash}`;

  s3.putFile(req.files.file.path, uploadPath, {
    'Content-Type': req.files.file.type,
    'x-amz-acl': 'public-read'
  })
  .then(() => {
    let uploadUrl = s3.client.url(uploadPath);
    console.log('[S3]:PUT saved to %s', uploadUrl);

    let note = new Note({
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
}

function show(req, res, next) {
  Note.findById(req.params.nid).exec()
  .then((note) => {
    if (_.isNull(note)) { return res.status(404).send('Not Found'); }
    return res.status(200).json(note);
  })
  .catch(next);
}

function update(req, res, next) {
  Note.findById(req.params.nid)
  .then((note) => {
    if (_.isNull(note)) { return res.status(404).send('Not Found'); }

    let uploadPath = url.parse(note.url).pathname;

    return s3.putFile(req.files.file.path, uploadPath, {
      'Content-Type': req.files.file.type,
      'x-amz-acl': 'public-read',
    })
    .then(() => {
      let uploadUrl = s3.client.url(uploadPath);
      console.log('[S3]:PUT saved to %s', uploadUrl);

      note.videoId = req.query.videoId || note.videoId;
      note.playlistId = req.query.playlistId || note.playlistId;
      note.type = req.query.type || note.type;

      return note.save();
    });
  })
  .then((note) => res.status(201).json(note))
  .catch(next);
}

function destroy(req, res, next) {
  Note.findById(req.params.nid)
  .then((note) => {
    if (_.isNull(note)) { return res.status(404).send('Not Found'); }
    let uploadPath = url.parse(note.url).pathname;
    return s3.deleteFile(uploadPath)
    .then((res) => {
      console.log('[S3]:DELETE', res.statusCode, res.headers);
      return note.remove();
    });
  })
  .then(() => res.status(204).send())
  .catch(next);
}

function getContents(req, res, next) {
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
}

exports.index = index;
exports.create = create;
exports.show = show;
exports.update = update;
exports.destroy = destroy;

exports.getContents = getContents;

