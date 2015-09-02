'use strict';

angular.module('learntubeApp')
.controller('UploadedLectureListCtrl', function($scope, $stateParams, Auth, $state, $http, $log, $mdDialog, $q, $mdToast) {
  $scope.playlistId = $stateParams.pid;
  $scope.go = $state.go;

  var onRejected = function(err) { $log.error(err); };

  var showToast = function(text) {
    $mdToast.show(
      $mdToast.simple()
      .content(text)
      .position('top right')
      .hideDelay(3000)
    );
  };

  var uploadFile = function(urls, file) {
    var deferred = $q.defer(); 
    var xhr = new XMLHttpRequest();
    xhr.file = file;

    xhr.onreadystatechange = function() {
      if(this.readyState === 4) {
        if(this.status === 200) {
          deferred.resolve(urls.accessUrl);
        } else {
          deferred.reject(this);
        }
      }
    };
    xhr.open('PUT', urls.signedUrl, true);
    xhr.send(file);

    return deferred.promise;
  };

  var postToBack = function(url, lecture) {
    var deferred = $q.defer();

    $http.post('/api/users/' + Auth.getCurrentUser()._id + '/uploaded', {
      videoId: lecture.snippet.resourceId.videoId,
      playlistId: $scope.playlistId,
      url: url
    }).then(function(res) {
      deferred.resolve(res.data);
    }, function() {
      deferred.reject(); 
    });

    return deferred.promise;
  };

  var getSignedUrl = function(file){
    var deferred = $q.defer();

    $http.get('/api/s3/credential', {
      params: {
        fileName: file.name,
        fileType: file.type,
      }, 
    })
    .then(function(res) {
      deferred.resolve(res.data);
    }, function() {
      deferred.reject(); 
    });

    return deferred.promise;
  };


  $http.get('/api/youtube/classes', {
    params: {
      playlistId: $scope.playlistId, 
    },
  }).then(function(res) {
    $scope.summary = res.data[0];
  }, function(err) {
    $log.error(err);
  });

  $http.get('/api/youtube/lecture-list', {
    params: {
      playlistId: $scope.playlistId,
    }, 
  }).then(function(res) {
    $scope.lectureList = res.data;
  }, function(err) {
    $log.error(err); 
  });

  $scope.showFileDialog = function(lecture, ev) {
    $mdDialog.show({
      controller: function($scope, $mdDialog) {
        $scope.cancel = function() {
          $mdDialog.cancel();
        };
        $scope.attachFile = function(file) {
          getSignedUrl(file)
          .then(function(s3Urls) {
            return uploadFile(s3Urls, file);
          }, onRejected)
          .then(function(url) {
            return postToBack(url, lecture);
          }, onRejected)
          .then(function(res) {
            $mdDialog.hide(res.data); 
          }, onRejected);
        };
      },
      templateUrl: 'components/dialog/attach-file.tmpl.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true
    })
    .then(function(uploaded) {
      showToast('File uploaded');
      $log.info(uploaded);
    }, onRejected);
  };

});
