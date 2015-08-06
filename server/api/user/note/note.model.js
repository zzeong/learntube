'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NoteSchema = new Schema({
  videoId: String,
  hash: String,
  url: String,
  s3Path: String,
  created: { type: Date, default: Date.now }
});

module.exports = NoteSchema;
