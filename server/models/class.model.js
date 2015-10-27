'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ClassSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  playlistId: { type: String, unique: true },
  addedAt: { type: Date, default: Date.now },
  lectures: [{
    videoId: String,
    completedAt: { type: Date, default: Date.now },
  }]
});

module.exports = mongoose.model('Class', ClassSchema);
