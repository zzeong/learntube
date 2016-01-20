'use strict';

var _ = require('lodash');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var WatchedContentSchema = new Schema({
  _watcher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  _class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  addedAt: { type: Date, default: Date.now },
  lectures: [{
    videoId: { type: String, required: true },
    completedAt: { type: Date, default: Date.now },
  }]
});

WatchedContentSchema
.pre('save', function (next) {
  let that = this;

  mongoose.models.WatchedContent.findOne({
    _watcher: that._watcher,
    _class: that._class
  })
  .then((classe) => {
    var errMsg = 'item already exists';

    function hasDuplicates(list) {
      return _.uniq(list).length !== list.length;
    }

    if (that.isNew && classe) {
      return next(new Error(errMsg));
    }

    if (that.lectures.length) {
      var videoIds = that.lectures.map((el) => el.videoId);
      if (hasDuplicates(videoIds)) { return next(new Error(errMsg)); }
    }

    next();
  });
});

module.exports = mongoose.model('WatchedContent', WatchedContentSchema);
