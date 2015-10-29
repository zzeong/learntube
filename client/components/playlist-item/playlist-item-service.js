'use strict';

angular.module('learntubeApp')
.factory('PlaylistItem', function (GApi, GoogleConst) {
  var pageToken = null;

  function serializeIds(list) {
    return list.map(function (item) {
      return item.snippet.resourceId.videoId;
    }).join(',');
  }

  function applyDuration(list) {
    var ids = serializeIds(list);

    return GApi.execute('youtube', 'videos.list', {
      key: GoogleConst.browserKey,
      part: 'id,snippet,contentDetails,status',
      id: ids,
      fields: 'items(id,snippet,contentDetails(duration),status)',
    })
    .then(function (res) {

      var resObj = {};
      res.items.forEach(function (item) {
        resObj[item.id] = item.contentDetails;
      });

      for (var i = 0; i < list.length; i++) {
        var targetVideo = list[i].snippet.resourceId.videoId;

        if (_.has(resObj, targetVideo)) {
          list[i].contentDetails = resObj[targetVideo];
        } else {
          list[i].contentDetails = { duration: 'PT0M00S' };
          list[i].snippet.title = 'Private video';
          list[i].snippet.thumbnails = { default: { url: 'assets/images/private_video.png' } };
        }
      }
      return list;
    });
  }

  return {
    get: function (p, opts) {
      if (!opts) { opts = {}; }
      opts.initialToken = opts.initialToken || false;

      pageToken = opts.initialToken ? null : pageToken;

      var params = _.merge({
        key: GoogleConst.browserKey,
        part: 'snippet,status',
        maxResults: 20,
        fields: 'items(snippet,status),nextPageToken',
        pageToken: pageToken,
      }, p);

      return GApi.execute('youtube', 'playlistItems.list', params)
      .then(function (res) {
        pageToken = res.nextPageToken;
        return applyDuration(res.items);
      });
    },
    getPageToken: function () {
      return pageToken;
    },
  };
});
