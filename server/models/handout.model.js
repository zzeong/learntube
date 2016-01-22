'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let HandoutSchema = new Schema({
  _uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  playlistId: String,
  videoId: String,
  fileName: String,
  url: String,
});

module.exports = mongoose.model('Handout', HandoutSchema);
