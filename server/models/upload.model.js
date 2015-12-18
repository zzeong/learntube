'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UploadSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  playlistId: String,
  videoId: String,
  fileName: String,
  url: String,
});

module.exports = mongoose.model('Upload', UploadSchema);
