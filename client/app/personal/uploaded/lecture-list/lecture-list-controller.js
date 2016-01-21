(function (angular) {
  'use strict';

  angular.module('learntubeApp')
  .controller('UploadedLectureListCtrl', UploadedLectureListCtrl);

  function UploadedLectureListCtrl($scope, $state, Auth, $http, $mdDialog, $mdToast) {
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

    $http.get('/api/classes', {
      params: { playlistId: $scope.playlistId },
    })
    .then((res) => {
      $scope.class = res.data[0];
      $scope.desc.html = newlineToBr($scope.class.description);
      $scope.desc.editing = $scope.class.description;
    })
    .catch(console.error);

    $http.get('/api/lectures', {
      params: _.pick($scope, 'playlistId')
    })
    .then((res) => {
      $scope.lectures = res.data;

      // lectures에 강의 삭제시 필요한 selected속성 부여
      for (var lecIdx in $scope.lectures) {
        $scope.lectures[lecIdx].selected = false;
      }
    });

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

          $http.get('/api/lectures/mine')
          .then((res) => {
            $scope.myVideos = res.data;
          })
          .catch(console.error);
        }

        function search(q) {
          $http.get('/api/search', {
            params: { q, type: 'video' },
          })
          .then((res) => $scope.searched = res.data)
          .catch(console.error);
        }

        function addLecture(video) {
          $http.post('/api/lectures', {
            playlistId: scope.playlistId,
            videoId: video.videoId || video.snippet.resourceId.videoId,
          })
          .then((res) => {
            scope.lectures.push(res.data);
            $mdDialog.hide();
          })
          .catch(console.error);
        }
      }
    }

    function deleteLectures () {
      var joinedId = $scope.willBeDeleted.map(_.property('videoId')).join(',');

      $http.delete('/api/lectures', {
        params: {
          playlistId: $scope.playlistId,
          videoId: joinedId
        }
      })
      .then(() => {
        var ea = $scope.willBeDeleted.length;
        showToast(ea + ' Lectures deleted');
        $scope.lectures = _.xor($scope.lectures, $scope.willBeDeleted);
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
      $http.put(`/api/classes/${$scope.class._id}`, {
        playlistId: $scope.playlistId,
        title: $scope.class.title,
        description: $scope.desc.editing,
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
      for (var idx in $scope.lectures) {
        // highlight를 주기 위한 처리
        if ($scope.lectures[idx] === lecture) {
          $scope.lectures[idx].selected = true;
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
      for (var i in $scope.lectures) {
        $scope.lectures[i].selected = false;
      }
      $scope.willBeDeleted = [];
      $scope.deleteToolbarState = false;
    };

  }

  UploadedLectureListCtrl.$inject = ['$scope', '$state', 'Auth', '$http', '$mdDialog', '$mdToast'];
})(angular);
