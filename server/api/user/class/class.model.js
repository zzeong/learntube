'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LectureSchema = require('./lecture/lecture.model');
var ClassSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  playlistId: String,
  addedAt: { type: Date, default: Date.now },
  lectures: [LectureSchema]
});

module.exports = mongoose.model('Class', ClassSchema);
