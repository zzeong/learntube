'use strict';

angular.module('learntubeApp')
.factory('PlaylistItem', function (GApi, GoogleConst) {
  var pageToken = null;

  var serializeIds = function (list) {
    return list.map(function (item) {
      return item.snippet.resourceId.videoId;
    }).join(',');
  };
  var applyDuration = function (list) {
    var ids = serializeIds(list);

    return GApi.execute('youtube', 'videos.list', {
      key: GoogleConst.browserKey,
      part: 'contentDetails',
      id: ids,
      fields: 'items(contentDetails(duration))',
    })
    .then(function (response) {
      list.forEach(function (item, i) {
        item.contentDetails = response.items[i].contentDetails;
      });
      return list;
    });
  };

  return {
    get: function (options, withDuration) {
      var opts = _.merge({
        key: GoogleConst.browserKey,
        part: 'snippet',
        maxResults: 20,
        fields: 'items(contentDetails,snippet,status),nextPageToken',
        pageToken: pageToken,
      }, options);
      withDuration = withDuration || false;

      return GApi.execute('youtube', 'playlistItems.list', opts)
      .then(function (res) {
        console.log(res);
        pageToken = res.nextPageToken || null;
        return applyDuration(res.items);
      });
    }
  };
});
