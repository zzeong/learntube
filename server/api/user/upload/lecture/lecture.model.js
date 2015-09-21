'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LectureSchema = new Schema({
  videoId: String,
  url: String,
});

module.exports = LectureSchema;
