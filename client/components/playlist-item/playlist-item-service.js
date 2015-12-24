(function (angular) {
  'use strict';

  angular.module('learntubeApp')
  .factory('PlaylistItem', PlaylistItem);

  function PlaylistItem(GApi, GoogleConst, YoutubeHelper) {
    var pageToken = null;

    return {
      get: (p, opts) => {
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
          return YoutubeHelper.applyAdditional(res.items, 'snippet.resourceId.videoId');
        })
        .then((res) => res.map(fillInvalidLecture));
      },
      getPageToken: () => pageToken,
    };

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
  }

  PlaylistItem.$inject = ['GApi', 'GoogleConst', 'YoutubeHelper'];
})(angular);
