'use strict';

var _ = require('lodash');
var url = require('url');
var crypto = require('crypto');
var knox = require('knox');
var Note = require('../../../models/note.model');
var config = require('../../../config/environment');

var s3 = knox.createClient({
  key: config.aws.accessKeyId,
  secret: config.aws.secretKey,
  bucket: config.aws.s3Bucket
});

var createRandomHash = function () {
  var id = crypto.randomBytes(20).toString('hex');
  return crypto.createHash('md5').update(id).digest('hex');
};

exports.index = function (req, res) {
  var data = _.assign(req.query, { userId: req.params.id });

  Note.find(data, function (err, notes) {
    if (err) { return res.status(500).send(err); }
    if (!notes) { return res.status(404).send('Not Found'); }

    return res.status(200).json(notes);
  });
};

exports.create = (req, res, next) => {
  var hash = createRandomHash();
  var uploadPath = '/' + req.user.email + '/' + hash;

  s3.putFile(req.files.file.path, uploadPath, {
    'Content-Type': req.files.file.type,
    'x-amz-acl': 'public-read'
  }, (err) => {
    if (err) { next(err); }

    var uploadUrl = s3.url(uploadPath);
    console.log('[S3]:PUT saved to %s', uploadUrl);

    var note = new Note({
      userId: req.params.id,
      videoId: req.body.videoId,
      playlistId: req.body.playlistId,
      type: req.body.type,
      resourceType: req.files.file.headers['content-type'],
      url: uploadUrl
    });

    note.save()
    .then(() => res.status(201).json(_.omit(note.toObject(), 'userId')))
    .catch(next);
  });
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
    s3.get(url.parse(note.url).pathname)
    .on('response', (response) => {
      let body = {
        _id: note._id,
        contents: ''
      };
      console.log('[S3]:GET', response.statusCode, response.headers);

      response.setEncoding('utf8');
      response.on('data', (chunked) => {
        body.contents += chunked;
      });
      response.on('end', () => res.status(200).json(body));
    })
    .end();
  })
  .catch(next);
};


exports.update = function (req, res) {
  Note.findById(req.params.nid, function (err, note) {
    if (err) { return res.status(500).send(err); }
    if (!note) { return res.status(404).send('Not Found'); }

    var uploadPath = url.parse(note.url).pathname;
    s3.putFile(req.files.file.path, uploadPath, {
      'Content-Type': req.files.file.type,
      'x-amz-acl': 'public-read',
    }, function (error) {
      if (error) { return res.status(500).send(error); }

      var uploadUrl = s3.url(uploadPath);
      console.log('[S3]:PUT saved to %s', uploadUrl);

      note.videoId = req.query.videoId || note.videoId;
      note.playlistId = req.query.playlistId || note.playlistId;
      note.type = req.query.type || note.type;

      note.save(function (error) {
        if (error) { return res.status(500).send(error); }
        return res.status(201).json(note);
      });
    });
  });
};



exports.destroy = (req, res, next) => {
  Note.findById(req.params.nid, (err, note) => {
    if (err) { return res.status(500).send(err); }
    if (!note) { return res.status(404).send('Not Found'); }

    s3.del(note.s3Path).on('response', (response) => {
      console.log('[S3]:DELETE', response.statusCode, response.headers);

      note.remove()
      .then(() => res.status(204).send())
      .catch(next);
    })
    .end();
  });
};

