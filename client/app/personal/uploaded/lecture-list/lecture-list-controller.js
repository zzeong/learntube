'use strict';

angular.module('learntubeApp')
.controller('UploadedLectureListCtrl', function ($scope, $state, Auth, $http, $mdDialog, $q, $mdToast, GApi, GoogleConst) {
  $scope.href = $state.href.bind(null);
  $scope.playlistId = $state.params.pid;
  $scope.lectureDelBucket = [];
  var scope = $scope;

  var compileToHTML = function (str) {
    var html = str.split('\n')
    .filter(function (p) { return p.length; })
    .map(function (p) { return '<p>' + p + '</p>'; })
    .join('');

    return html;
  };

  var showToast = function (text) {
    $mdToast.show(
      $mdToast.simple()
      .content(text)
      .position('top right')
      .hideDelay(3000)
    );
  };

  $http.get('/api/youtube/mine/playlists', {
    params: {
      playlistId: $scope.playlistId,
    },
  })
  .then(function (res) {
    for (var i in res.data.items) {
      if (res.data.items[i].id === $scope.playlistId) {
        $scope.summary = res.data.items[i];
        $scope.summary.snippet.description = compileToHTML($scope.summary.snippet.description);
      }
    }
  })
  .catch(console.error);

  $http.get('/api/youtube/mine/playlistitems', {
    params: {
      playlistId: $scope.playlistId,
      withDuration: true,
    },
  })
  .then(function (res) {
    $scope.lectureList = res.data.items;
    console.log($scope.lectureList);
    return $http.get('/api/users/' + Auth.getCurrentUser()._id + '/uploads', {
      params: {
        playlistId: $scope.playlistId,
      },
    });
  })
  .then(function (res) {
    if (_.has(res.data, 'message') && res.data.message === 'empty') {
      return;
    }

    $scope.upload = res.data[0];
    var files = $scope.upload.lectures;
    files.forEach(function (fileMeta) {
      for (var i = 0; i < $scope.lectureList.length; i++) {
        if ($scope.lectureList[i].snippet.resourceId.videoId === fileMeta.videoId) {
          $scope.lectureList[i].file = fileMeta;
        }
      }
    });
  })
  .catch(console.error);


  $scope.haveUploadedFile = function (lecture) {
    return 'file' in lecture;
  };

  $scope.showLectureDialog = function (lecture, ev) {
    $mdDialog.show({
      controller: function ($scope, $mdDialog) {
        $scope.getMyVideos = function () {
          if ($scope.myVideos) { return; }

          $http.get('/api/youtube/mine/videos', {
            params: { withDuration: true }
          })
          .then(function (res) {
            $scope.myVideos = res.data.items;
          })
          .catch(console.error);
        };

        $scope.search = function () {
          GApi.execute('youtube', 'search.list', {
            key: GoogleConst.browserKey,
            part: 'snippet',
            q: $scope.query,
            maxResults: 50,
            type: 'video',
          })
          .then(function (res) {
            $scope.searched = res.items;
          })
          .catch(console.error);
        };

        $scope.selectVideo = function (video) {
          $scope.selectedVideo = video;
        };

        $scope.isSelected = function (video) {
          return $scope.selectedVideo === video;
        };

        $scope.cancel = function () {
          $mdDialog.cancel();
        };

        $scope.addLecture = function (video) {
          $http.post('/api/youtube/mine/playlistitems', {
            resource: {
              snippet: {
                playlistId: scope.playlistId,
                resourceId: {
                  kind: video.id.kind || 'youtube#video',
                  videoId: video.id.videoId || video.snippet.resourceId.videoId
                }
              }
            },
          }, {
            params: { withDuration: true }
          })
          .then(function (res) {
            if (res.status === 201) {
              console.log(res.data);
              scope.lectureList.push(res.data);
              $mdDialog.hide();
            }
          })
          .catch(console.error);
        };
      },
      templateUrl: 'components/dialog/add-lecture.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true
    })
    .then(function () {
      showToast('Lecture added');
    })
    .catch(console.error);
  };

  $scope.pushLecture = function (lecture) {
    $scope.lectureDelBucket.push(lecture);
  };

  $scope.deleteLectures = function () {
    var joinedId = $scope.lectureDelBucket.map(function (lecture) {
      return lecture.snippet.resourceId.videoId;
    }).join(',');

    $http.delete('/api/youtube/mine/playlistitems', {
      params: {
        playlistId: $scope.playlistId,
        videoId: joinedId
      }
    })
    .then(function () {
      $scope.lectureList = _.xor($scope.lectureList, $scope.lectureDelBucket);
      $scope.lectureDelBucket = [];
      showToast('Lecture deleted');
    })
    .catch(console.error);
  };
});

