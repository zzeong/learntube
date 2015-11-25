'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ClassSchema = new Schema({
  categorySlug: { type: String, required: true },
  playlistId: { type: String, required: true },
  channelId: { type: String, required: true },
  rate: Number,
  views: Number,
  registeredAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Class', ClassSchema);
