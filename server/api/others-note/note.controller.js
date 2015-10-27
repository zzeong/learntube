'use strict';

var Note = require('../../models/note.model');

exports.index = function (req, res) {
  Note.find(req.query)
  .populate({
    path: 'userId',
    select: 'name google.image.url'
  })
  .exec(function (err, notes) {
    if (err) { return res.status(500).send(err); }
    if (!notes.length) { return res.status(404).send('Not Found'); }

    var results = notes.map(function (note) {
      return {
        _id: note._id,
        userId: note.userId,
        url: note.url,
        resourceType: note.resourceType
      };
    });

    return res.status(200).json(results);
  });
};
