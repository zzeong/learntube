'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NoteSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  videoId: String,
  playlistId: String,
  type: String,
  resourceType: String,
  created: { type: Date, default: Date.now },
  url: String,
});

module.exports = mongoose.model('Note', NoteSchema);
