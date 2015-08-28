'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LectureSchema = require('./lecture/lecture.model');
var UploadedSchema = new Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User'
    },
    playlistId: String,
    lectures: [LectureSchema],
});

module.exports = mongoose.model('Uploaded', UploadedSchema);
