(function (angular) {
  'use strict';

  angular.module('learntubeApp')
  .controller('UploadedLectureListCtrl', UploadedLectureListCtrl);

  function UploadedLectureListCtrl($scope, $state, Auth, $http, $mdDialog, $q, $mdToast, GApi, GoogleConst, YoutubeHelper) {
    $scope.href = $state.href;
    $scope.playlistId = $state.params.pid;
    $scope.deleteLectures = deleteLectures;
    $scope.haveUploadedFile = haveUploadedFile;
    $scope.showLectureDialog = showLectureDialog;
    $scope.lectureDelBucket = [];
    $scope.isOnWrite = false;
    $scope.editDesc = editDesc;
    $scope.cancelDesc = cancelDesc;
    $scope.updateDesc = updateDesc;
    $scope.desc = {};
    $scope.willBeDeleted = [];
    $scope.deleteToolbarState = ($scope.willBeDeleted.length > 0) ? true : false;

    var scope = $scope;

    $http.get('/api/youtube/mine/playlists', {
      params: { id: $scope.playlistId, },
    })
    .then((res) => {
      $scope.class = res.data.items[0];
      $scope.desc.html = newlineToBr($scope.class.description);
      $scope.desc.editing = $scope.class.description;
    })
    .catch(console.error);

    $http.get('/api/youtube/mine/playlistitems', {
      params: {
        playlistId: $scope.playlistId,
        withDuration: true,
      },
    })
    .then((res) => { $scope.lectureList = res.data.items;

      // lectureList에 강의 삭제시 필요한 selected속성 부여
      for (var lecIdx in $scope.lectureList) {
        $scope.lectureList[lecIdx].selected = false;
      }
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

    function deleteLectures () {
      var joinedId = $scope.willBeDeleted.map(function (obj) {
        return obj.snippet.resourceId.videoId;
      }).join(',');

      $http.delete('/api/youtube/mine/playlistitems', {
        params: {
          playlistId: $scope.playlistId,
          videoId: joinedId
        }
      })
      .then(() => {
        var ea = $scope.willBeDeleted.length;
        showToast(ea + ' Lectures deleted');
        $scope.lectureList = _.xor($scope.lectureList, $scope.willBeDeleted);
        $scope.willBeDeleted = [];
        $scope.deleteToolbarState = false;
      })
      .catch(console.error);
    }

    function showToast(text) {
      $mdToast.show(
        $mdToast.simple()
        .content(text)
        .position('bottom right')
        .hideDelay(3000)
      );
    }

    function newlineToBr(str) {
      return str.replace(/(?:\r\n|\r|\n)/g, '<br>');
    }

    function editDesc() {
      $scope.isOnWrite = true;
    }

    function cancelDesc() {
      $scope.desc.editing = $scope.class.description;
      $scope.isOnWrite = false;
    }

    function updateDesc() {
      $http.put('/api/youtube/mine/playlists', {
        resource: {
          id: $scope.playlistId,
          snippet: {
            title: $scope.class.title,
            description: $scope.desc.editing,
          }
        },
      })
      .then((res) => {
        $scope.class = res.data;
        $scope.desc.html = newlineToBr($scope.desc.editing);
        $scope.isOnWrite = false;
      })
      .catch(console.error);
    }

    $scope.toggle = function (lecture, list, ev) {
      var idx = list.indexOf(lecture);
      if (idx > -1) {
        list.splice(idx, 1);
      } else {
        list.push(lecture);
      }

      if (list.length > 0) {
        $scope.deleteToolbarState = true;
      } else {
        $scope.deleteToolbarState = false;
      }
      ev.preventDefault();
    };

    // mobile에서는 long-press로 고르기
    $scope.makeDeleteListMobile = function (lecture) {
      for (var idx in $scope.lectureList) {
        // highlight를 주기 위한 처리
        if ($scope.lectureList[idx] === lecture) {
          $scope.lectureList[idx].selected = true;
        }
      }

      // 중복검사
      var existIdx = $scope.willBeDeleted.indexOf(lecture);
      if (existIdx === -1) {
        $scope.willBeDeleted.push(lecture);
      }

      $scope.deleteToolbarState = true;
    };

    $scope.itemOnTouchEnd = function () {
      console.log('Touch end');
    };

    $scope.goBackward = function () {
      for (var i in $scope.lectureList) {
        $scope.lectureList[i].selected = false;
      }
      $scope.willBeDeleted = [];
      $scope.deleteToolbarState = false;
    };

  }

  UploadedLectureListCtrl.$inject = ['$scope', '$state', 'Auth', '$http', '$mdDialog', '$q', '$mdToast', 'GApi', 'GoogleConst', 'YoutubeHelper'];
})(angular);
