'use strict';

var Class = require('../../../../models/class.model');

exports.create = function (req, res, next) {
  if (!req.body.videoId) {
    return next(new Error('required parameter is not exist'));
  }

  Class.findById(req.params.cid)
  .then(function (classe) {
    classe.lectures.push({ videoId: req.body.videoId });
    return classe.save();
  })
  .then(function (classe) {
    var lectures = classe.lectures;
    var lecture = lectures[lectures.length - 1];
    return res.status(201).json(lecture);
  })
  .catch(function (err) {
    return next(err);
  });
};
