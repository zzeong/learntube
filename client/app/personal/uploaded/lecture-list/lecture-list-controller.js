(function (angular) {
  'use strict';

  angular.module('learntubeApp')
  .controller('UploadedLectureListCtrl', UploadedLectureListCtrl);

  function UploadedLectureListCtrl($scope, $state, Auth, $http, $mdDialog, $q, $mdToast, GApi, GoogleConst) {
    $scope.href = $state.href.bind(null);
    $scope.playlistId = $state.params.pid;
    $scope.pushLecture = pushLecture;
    $scope.deleteLectures = deleteLectures;
    $scope.haveUploadedFile = haveUploadedFile;
    $scope.showLectureDialog = showLectureDialog;
    $scope.lectureDelBucket = [];
    var scope = $scope;

    $http.get('/api/youtube/mine/playlists', {
      params: {
        playlistId: $scope.playlistId,
      },
    })
    .then((res) => {
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
    .then((res) => {
      $scope.lectureList = res.data.items;
      console.log($scope.lectureList);
      return $http.get('/api/users/' + Auth.getCurrentUser()._id + '/uploads', {
        params: {
          playlistId: $scope.playlistId,
        },
      });
    })
    .then((res) => {
      if (_.has(res.data, 'message') && res.data.message === 'empty') {
        return;
      }

      $scope.upload = res.data[0];
      var files = $scope.upload.lectures;
      files.forEach((fileMeta) => {
        for (var i = 0; i < $scope.lectureList.length; i++) {
          if ($scope.lectureList[i].snippet.resourceId.videoId === fileMeta.videoId) {
            $scope.lectureList[i].file = fileMeta;
          }
        }
      });
    })
    .catch(console.error);


    function haveUploadedFile(lecture) {
      return 'file' in lecture;
    }

    function showLectureDialog(lecture, ev) {
      $mdDialog.show({
        controller: Controller,
        templateUrl: 'components/dialog/add-lecture.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true
      })
      .then(() => {
        showToast('Lecture added');
      })
      .catch(console.error);

      function Controller ($scope, $mdDialog) {
        $scope.getMyVideos = getMyVideos;
        $scope.selectVideo = selectVideo;
        $scope.isSelected = isSelected;
        $scope.cancel = cancel;
        $scope.addLecture = addLecture;
        $scope.search = search;

        function selectVideo(video) { $scope.selectedVideo = video; }
        function isSelected(video) { return $scope.selectedVideo === video; }
        function cancel() { $mdDialog.cancel(); }

        function getMyVideos() {
          if ($scope.myVideos) { return; }

          $http.get('/api/youtube/mine/videos', {
            params: { withDuration: true }
          })
          .then((res) => {
            $scope.myVideos = res.data.items;
          })
          .catch(console.error);
        }

        function search() {
          GApi.execute('youtube', 'search.list', {
            key: GoogleConst.browserKey,
            part: 'snippet',
            q: $scope.query,
            maxResults: 50,
            type: 'video',
          })
          .then((res) => {
            $scope.searched = res.items;
          })
          .catch(console.error);
        }

        function addLecture(video) {
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
          .then((res) => {
            if (res.status === 201) {
              console.log(res.data);
              scope.lectureList.push(res.data);
              $mdDialog.hide();
            }
          })
          .catch(console.error);
        }
      }
    }

    function pushLecture(lecture) {
      $scope.lectureDelBucket.push(lecture);
    }

    function deleteLectures () {
      var joinedId = $scope.lectureDelBucket.map((lecture) => {
        return lecture.snippet.resourceId.videoId;
      }).join(',');

      $http.delete('/api/youtube/mine/playlistitems', {
        params: {
          playlistId: $scope.playlistId,
          videoId: joinedId
        }
      })
      .then(() => {
        $scope.lectureList = _.xor($scope.lectureList, $scope.lectureDelBucket);
        $scope.lectureDelBucket = [];
        showToast('Lecture deleted');
      })
      .catch(console.error);
    }

    function compileToHTML(str) {
      return str.split('\n')
      .filter((p) => p.length)
      .map((p) => '<p>' + p + '</p>')
      .join('');
    }

    function showToast(text) {
      $mdToast.show(
        $mdToast.simple()
        .content(text)
        .position('top right')
        .hideDelay(3000)
      );
    }
  }

  UploadedLectureListCtrl.$inject = ['$scope', '$state', 'Auth', '$http', '$mdDialog', '$q', '$mdToast', 'GApi', 'GoogleConst'];
})(angular);
