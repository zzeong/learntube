(function (angular) {
  'use strict';

  angular.module('learntubeApp')
  .controller('EditLectureCtrl', EditLectureCtrl);

  function EditLectureCtrl($scope, $state, $mdDialog, $q, $http, Auth, $mdToast) {
    $scope.playlistId = $state.params.pid;
    $scope.videoId = $state.params.vid;
    $scope.handout = {
      uploaded: null,
      seleted: null
    };

    $http.get('/api/youtube/mine/playlistitems', {
      params: {
        videoId: $scope.videoId,
        playlistId: $scope.playlistId,
        withDuration: true,
      },
    })
    .then((res) => {
      $scope.lecture = res.data.items[0];
      return $http.get('/api/users/' + Auth.getCurrentUser()._id + '/uploads', {
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
    .catch(console.error);

    $scope.selectFile = (file) => { $scope.handout.selected = file; };
    $scope.clearHandout = (handout) => {};
    $scope.uploadHandout = (handout) => {
      getSignedUrl(handout)
      .then((s3Urls) => uploadFile(handout, s3Urls))
      .then((url) => postToBack({
        videoId: $scope.videoId,
        playlistId: $scope.playlistId,
        url: url,
        fileName: handout.name
      }))
      .then((handout) => {
        $scope.handout.uploaded = handout;
        $scope.handout.selected = null;
        showToast('File uploaded');
      })
      .catch(console.error);
    };

    function uploadFile(file, urls) {
      var deferred = $q.defer();
      var xhr = new XMLHttpRequest();
      xhr.file = file;

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            deferred.resolve(urls.accessUrl);
          } else {
            deferred.reject(this);
          }
        }
      };
      xhr.open('PUT', urls.signedUrl, true);
      xhr.send(file);

      return deferred.promise;
    }

    function postToBack(params) {
      var deferred = $q.defer();

      $http.post('/api/users/' + Auth.getCurrentUser()._id + '/uploads', params)
      .then((res) => deferred.resolve(res.data))
      .catch(console.error);

      return deferred.promise;
    }

    function getSignedUrl(file) {
      var deferred = $q.defer();

      $http.get('/api/s3/credential', {
        params: {
          fileName: file.name,
          fileType: file.type,
        },
      })
      .then((res) => deferred.resolve(res.data))
      .catch(console.error);

      return deferred.promise;
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

  EditLectureCtrl.$inject = ['$scope', '$state', '$mdDialog', '$q', '$http', 'Auth', '$mdToast'];
})(angular);