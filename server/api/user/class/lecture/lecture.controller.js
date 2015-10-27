'use strict';

var Class = require('../../../../models/class.model');

exports.create = function (req, res) {
  Class.findById(req.params.cid, function (err, classe) {
    if (err) { return res.status(500).send(err); }
    if (!classe) { return res.status(404).send(err); }

    classe.lectures.push({ videoId: req.body.videoId });
    classe.save(function (saveErr, savedClass) {
      if (err) { return res.status(500).send(err); }
      return res.status(201).json(savedClass);
    });
  });
};
