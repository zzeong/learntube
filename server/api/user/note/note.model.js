'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// 스키마 생성
var NoteSchema = new Schema({
  userId: {
  	type: mongoose.Schema.Types.ObjectId,
  	ref: 'User'
  },
  videoId: String,
  created: { type: Date, default: Date.now },
  hash: String,
  url: String,
  s3Path: String,
});

module.exports = mongoose.model('Note', NoteSchema);
