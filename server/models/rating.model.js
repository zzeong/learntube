'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RatingSchema = new Schema({
  playlistId: String,
  points: { type: Number, default: 0 }
});

module.exports = mongoose.model('Rating', RatingSchema);
