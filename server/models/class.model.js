'use strict';

var _ = require('lodash');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ClassSchema = new Schema({
  categorySlug: { type: String },
  playlistId: { type: String, required: true },
  channelId: { type: String, required: true },
  rate: Number,
  views: Number,
  registeredAt: { type: Date, default: Date.now },
});

ClassSchema.methods.bindYoutube = bindYoutube;
ClassSchema.statics.pickYoutubeData = pickYoutubeData;
ClassSchema.statics.extractDoc = extractDoc;

function bindYoutube(item) {
  /*jshint validthis:true */
  return _.assign(this.toObject(), pickYoutubeData(item));
}

function pickYoutubeData(item) {
  let get = _.get.bind(null, item);
  return {
    thumbnailUrl: get('snippet.thumbnails.medium.url', ''),
    title: get('snippet.title', ''),
    description: get('snippet.description', ''),
    channelTitle: get('snippet.channelTitle', ''),
    videoCount: get('contentDetails.itemCount', '')
  };
}

function extractDoc(item) {
  let get = _.get.bind(null, item);
  return {
    playlistId: get('id'),
    channelId: get('snippet.channelId'),
    rate: 0,
    views: 0,
  };
}

module.exports = mongoose.model('Class', ClassSchema);
