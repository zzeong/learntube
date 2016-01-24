'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const s3 = require('../components/s3');

let HandoutSchema = new Schema({
  _uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  playlistId: { type: String, required: true },
  videoId: { type: String, required: true },
  fileName: String,
  s3Path: { type: String, required: true },
});

HandoutSchema.virtual('url').get(function () {
  return s3.client.url(this.s3Path);
});

module.exports = mongoose.model('Handout', HandoutSchema);
