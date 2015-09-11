'use strict';

angular.module('learntubeApp')
.controller('UploadedLectureListCtrl', function($scope, $stateParams, Auth, $state, $http, $log, $mdDialog, $q, $mdToast, GApi, GoogleConst) {
  $scope.playlistId = $stateParams.pid;
  $scope.go = $state.go;
  var scope = $scope;

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


  $http.get('/api/youtube/mine/playlists', {
    params: {
      playlistId: $scope.playlistId, 
    },
  }).then(function(res) {
    $scope.summary = res.data.items[0];
  }, function(err) {
    $log.error(err);
  });

  $http.get('/api/youtube/mine/playlistitems', {
    params: {
      playlistId: $scope.playlistId,
      withDuration: true,
    }, 
  })
  .then(function(res) {
    $scope.lectureList = res.data.items;
    return $http.get('/api/users/' + Auth.getCurrentUser()._id + '/uploaded', {
      params: {
        playlistId: $scope.playlistId, 
      },
    });
  }, function(err) {
    $log.error(err); 
  })
  .then(function(res) {
    $scope.upload = res.data[0];
    var files = $scope.upload.lectures;
    files.forEach(function(fileMeta) {
      for(var i = 0; i < $scope.lectureList.length; i++) {
        if($scope.lectureList[i].snippet.resourceId.videoId === fileMeta.videoId) {
          $scope.lectureList[i].file = fileMeta;
        }
      }
    });
  }, onRejected);


  $scope.haveUploadedFile = function(lecture) {
    return 'file' in lecture;
  };

  $scope.showFileDialog = function(lecture, ev) {
    $mdDialog.show({
      controller: function($scope, $mdDialog) {
        $scope.haveUploadedFile = scope.haveUploadedFile;
        $scope.lecture = lecture;

        $scope.deleteFile = function(lecture) {
          $http.delete('/api/users/' + Auth.getCurrentUser()._id + '/uploaded/' + scope.upload._id + '/lectures/' + lecture.file._id)
          .then(function() {
            delete lecture.file;
            showToast('File deleted');
          }, onRejected);
        };
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
          .then(function(uploaded) {
            $mdDialog.hide(uploaded); 
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
      lecture.file = uploaded.lectures.filter(function(fileMeta) {
        return fileMeta.videoId === lecture.snippet.resourceId.videoId;
      })[0];
      $log.info(uploaded);
    }, onRejected);
  };

  $scope.showLectureDialog = function(lecture, ev) {
    $mdDialog.show({
      controller: function($scope, $mdDialog) {
        $scope.search = function() {
          GApi.execute('youtube', 'search.list', {
            key: GoogleConst.browserKey,
            part: 'snippet',
            q: $scope.query,
            maxResults: 50,
            type: 'video',
          }).then(function(res) {
            $scope.searched = res.items;
          }, onRejected);
        };

        $scope.selectVideo = function(video) {
          $scope.selectedVideo = video; 
        };

        $scope.isSelected = function(video) {
          return $scope.selectedVideo === video; 
        };

        $scope.cancel = function() {
          $mdDialog.cancel();
        };

        $scope.addLecture = function() {
          $http.post('/api/youtube/mine/playlistitems', {
            resource: {
              snippet: {
                playlistId: scope.playlistId,
                resourceId: {
                  kind: $scope.selectedVideo.id.kind,
                  videoId: $scope.selectedVideo.id.videoId
                }
              }
            },
          }, { 
            params: { withDuration: true }
          })
          .then(function(res) {
            if(res.status === 201) {
              scope.lectureList.push(res.data);
              $mdDialog.hide();
            }
          }, onRejected);

        };
      },
      templateUrl: 'components/dialog/add-lecture.tmpl.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true
    })
    .then(function() {
      showToast('Lecture added');
    }, onRejected);

  };

});
