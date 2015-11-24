'use strict';

var _ = require('lodash');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var WatchedContentSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  playlistId: { type: String, required: true },
  addedAt: { type: Date, default: Date.now },
  lectures: [{
    videoId: { type: String, required: true },
    completedAt: { type: Date, default: Date.now },
  }]
});

WatchedContentSchema
.pre('save', function (next) {
  var that = this;

  mongoose.models.WatchedContent.findOne({
    userId: that.userId,
    playlistId: that.playlistId,
  })
  .then(function (classe) {
    var errMsg = 'item already exists';

    function hasDuplicates(list) {
      return _.uniq(list).length !== list.length;
    }

    if (that.isNew && classe) {
      return next(new Error(errMsg));
    }

    if (that.lectures.length) {
      var videoIds = that.lectures.map(function (el) { return el.videoId; });
      if (hasDuplicates(videoIds)) { return next(new Error(errMsg)); }
    }

    next();
  });
});

module.exports = mongoose.model('WatchedContent', WatchedContentSchema);
