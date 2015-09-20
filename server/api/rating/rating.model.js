'use strict';

var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');
var Schema = mongoose.Schema;

var RatingSchema = new Schema({
  playlistId: String,
  points: { type: Number, default: 0 }
});

RatingSchema.plugin(findOrCreate);

module.exports = mongoose.model('Rating', RatingSchema);
