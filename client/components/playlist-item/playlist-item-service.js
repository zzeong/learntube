'use strict';

angular.module('learntubeApp')
.factory('PlaylistItem', function (GApi, GoogleConst, $filter) {
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
      list.forEach(function (item, i) {
        item.contentDetails = res.items[i].contentDetails;
      });
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
        res.items = $filter('onlyPublic')(res.items);
        pageToken = res.nextPageToken;
        return applyDuration(res.items);
      });
    },
    getPageToken: function () {
      return pageToken;
    },
  };
});
