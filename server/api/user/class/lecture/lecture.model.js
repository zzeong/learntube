'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LectureSchema = new Schema({
  videoId: String,
  completedAt: { type: Date, default: Date.now },
});

module.exports = LectureSchema;
