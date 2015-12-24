(function (angular) {
  'use strict';

  angular.module('learntubeApp')
  .controller('UploadedLectureListCtrl', UploadedLectureListCtrl);

  function UploadedLectureListCtrl($scope, $state, Auth, $http, $mdDialog, $q, $mdToast, GApi, GoogleConst, YoutubeHelper) {
    $scope.href = $state.href;
    $scope.playlistId = $state.params.pid;
    $scope.pushLecture = pushLecture;
    $scope.deleteLectures = deleteLectures;
    $scope.haveUploadedFile = haveUploadedFile;
    $scope.showLectureDialog = showLectureDialog;
    $scope.lectureDelBucket = [];
    var scope = $scope;

    $http.get('/api/youtube/mine/playlists', {
      params: { id: $scope.playlistId, },
    })
    .then((res) => {
      $scope.class = res.data.items[0];
      $scope.class.description = compileToHTML($scope.class.description);
    })
    .catch(console.error);

    $http.get('/api/youtube/mine/playlistitems', {
      params: {
        playlistId: $scope.playlistId,
        withDuration: true,
      },
    })
    .then((res) => { $scope.lectureList = res.data.items; })
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
          .then((res) => YoutubeHelper.applyAdditional(res.items, 'id.videoId'))
          .then((res) => { $scope.searched = res; })
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
        .position('bottom right')
        .hideDelay(3000)
      );
    }
  }

  UploadedLectureListCtrl.$inject = ['$scope', '$state', 'Auth', '$http', '$mdDialog', '$q', '$mdToast', 'GApi', 'GoogleConst', 'YoutubeHelper'];
})(angular);
