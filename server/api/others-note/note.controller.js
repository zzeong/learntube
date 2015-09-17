'use strict';

var Note = require('../user/note/note.model');
var knox = require('knox');
var config = require('../../config/environment');
var Promise = require('promise');


exports.index = function(req, res) {
  Note.find(req.query)
  .populate({
    path: 'userId',
    select: 'name google.image.url' 
  })
  .exec(function(err, notes) {
    if(err) { return res.status(500).send(err); } 
    if(!notes.length) { return res.status(404).send('Not Found'); }

    var results = notes.map(function(note) {
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
