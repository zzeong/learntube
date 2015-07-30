'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var NoteSchema = new Schema({
  videoId: String,
  hash: String,
  url: String,
  created: { type: Date, default: Date.now }
});

module.exports = NoteSchema;
