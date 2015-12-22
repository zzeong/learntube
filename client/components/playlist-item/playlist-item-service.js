(function (angular) {
  'use strict';

  angular.module('learntubeApp')
  .factory('PlaylistItem', PlaylistItem);

  function PlaylistItem(GApi, GoogleConst) {
    var pageToken = null;

    return {
      get: function (p, opts) {
        opts = opts || {};
        opts.initialToken = opts.initialToken || false;

        pageToken = opts.initialToken ? null : pageToken;

        var params = _.assign({
          key: GoogleConst.browserKey,
          part: 'snippet,status',
          maxResults: 20,
          fields: 'items(snippet,status),nextPageToken',
          pageToken: pageToken,
        }, p);

        return GApi.execute('youtube', 'playlistItems.list', params)
        .then((res) => {
          pageToken = res.nextPageToken;
          return applyAdditional(res.items);
        });
      },
      getPageToken: function () {
        return pageToken;
      },
    };

    function serializeIds(list) {
      return list.map(function (item) {
        return item.snippet.resourceId.videoId;
      }).join(',');
    }

    function fillPrivateLecture(lecture) {
      var status = lecture.status.privacyStatus;
      if (status !== 'public') {
        lecture.contentDetails = { duration: 'PT0M00S' };
        lecture.snippet.thumbnails = { medium: { url: 'assets/images/private_video.png' } };
      }
      return lecture;
    }

    function fillUnavailableLecture(lecture) {
      var status = lecture.status.uploadStatus;
      if (status !== 'processed' && status !== 'uploaded') {
        lecture.snippet.thumbnails = { medium: { url: 'assets/images/private_video.png' } };
      }
      return lecture;
    }

    function fillInvalidLecture(lecture) {
      lecture = fillPrivateLecture(lecture);
      lecture = fillUnavailableLecture(lecture);
      return lecture;
    }

    function applyAdditional(list) {
      var ids = serializeIds(list);

      return GApi.execute('youtube', 'videos.list', {
        key: GoogleConst.browserKey,
        part: 'id,contentDetails,status,statistics',
        id: ids,
        fields: 'items(id,contentDetails(duration),status,statistics)',
      })
      .then(function (res) {
        var mappedById =  _.indexBy(res.items, (item) => item.id);

        list = list.map((lecture) => {
          return _.assign(lecture, _.omit(mappedById[lecture.snippet.resourceId.videoId], 'id'));
        })
        .map(fillInvalidLecture);
        return list;
      });
    }
  }

  PlaylistItem.$inject = ['GApi', 'GoogleConst'];
})(angular);
