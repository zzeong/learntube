(function (angular) {
  'use strict';

  angular.module('learntubeApp')
  .controller('LectureInfoCtrl', LectureInfoCtrl);

  function LectureInfoCtrl($scope, $state, $mdDialog, $q, $http, Auth, $mdToast, Upload) {
    $scope.playlistId = $state.params.pid;
    $scope.videoId = $state.params.vid;
    $scope.showConfirmDialog = showConfirmDialog;
    $scope.selectFile = selectFile;
    $scope.uploadHandout = uploadHandout;
    $scope.removeHandout = removeHandout;
    $scope.handout = {
      uploaded: null,
      seleted: null
    };

    $http.get('/api/lectures', {
      params: _.pick($scope, ['videoId', 'playlistId'])
    })
    .then((res) => {
      $scope.lecture = _.first(res.data.items);
      return $http.get('/api/users/' + Auth.getCurrentUser()._id + '/handouts', {
        params: {
          playlistId: $scope.playlistId,
          videoId: $scope.videoId
        },
      });
    })
    .then((res) => {
      if (res.data.length) {
        $scope.handout.uploaded = res.data[0];
      }
    })
    .catch((e) => console.error(e));


    function selectFile(file) {
      $scope.handout.selected = file;
    }

    function uploadHandout(file) {
      Upload.upload({
        url: `/api/users/${Auth.getCurrentUser()._id}/handouts`,
        method: 'POST',
        fields: _.pick($scope, ['playlistId', 'videoId']),
        file: file,
      })
      .then((res) => {
        $scope.handout.uploaded = res.data;
        $scope.handout.selected = null;
        showToast('File uploaded');
      })
      .catch((e) => console.error(e));
    }

    function showToast(text) {
      $mdToast.show(
        $mdToast.simple()
        .content(text)
        .position('bottom right')
        .hideDelay(3000)
      );
    }

    function removeHandout() {
      $http.delete('/api/users/' + Auth.getCurrentUser()._id + '/handouts/' + $scope.handout.uploaded._id)
      .then(() => {
        $scope.handout.uploaded = null;
        showToast('File removed');
      });
    }

    function showConfirmDialog(ev) {
      var confirm = $mdDialog.confirm()
      .title('Delete the handout')
      .textContent('Are you sure?')
      .ariaLabel('Delete the handout')
      .targetEvent(ev)
      .ok('Ok')
      .cancel('Cancel');

      $mdDialog.show(confirm)
      .then(removeHandout);
    }
  }

  LectureInfoCtrl.$inject = ['$scope', '$state', '$mdDialog', '$q', '$http', 'Auth', '$mdToast', 'Upload'];
})(angular);
