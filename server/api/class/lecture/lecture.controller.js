'use strict';

var Upload = require('../../../models/upload.model');
var config = require('../../../config/environment');
var knox = require('knox');
var url = require('url');
var fs = require('fs');

var s3 = knox.createClient({
  key: config.aws.accessKeyId,
  secret: config.aws.secretKey,
  bucket: config.aws.s3Bucket
});


function removeFile(path) {
  fs.unlink(path, () => {
    console.log('Successfully deleted %s', path);
  });
}

function streamFile(res, path) {
  return () => {
    var rs = fs.createReadStream(path);
    rs.pipe(res);
    rs.on('end', () => { removeFile(path); });
  };
}

exports.getHandout = (req, res, next) => {
  var query = {
    playlistId: req.params.pid,
    videoId: req.params.vid
  };

  Upload.findOne(query).exec()
  .then((upload) => {
    if (!upload) { throw new Error('not found'); }

    var filePath = './' + upload.fileName;
    var ws = fs.createWriteStream(filePath);
    var s3Path = url.parse(upload.url).pathname;

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename=' + upload.fileName);

    s3.getFile(s3Path.substring(s3Path.indexOf('/', 1)), (error, response) => {
      if (error) { throw new Error(); }

      response.pipe(ws);
      response.on('end', streamFile(res, filePath));
    });
  })
  .catch(next);
};
