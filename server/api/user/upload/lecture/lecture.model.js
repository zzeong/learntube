'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LectureSchema = new Schema({
  videoId: String,
  s3Url: String,
});

module.exports = LectureSchema;
