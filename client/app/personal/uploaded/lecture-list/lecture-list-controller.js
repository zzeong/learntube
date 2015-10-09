'use strict';

angular.module('learntubeApp')
.controller('UploadedLectureListCtrl', function ($scope, $stateParams, Auth, $state, $http, $mdDialog, $q, $mdToast, GApi, GoogleConst) {
  $scope.playlistId = $stateParams.pid;
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

  var uploadFile = function (file, urls) {
    var deferred = $q.defer();
    var xhr = new XMLHttpRequest();
    xhr.file = file;

    xhr.onreadystatechange = function () {
      if (this.readyState === 4) {
        if (this.status === 200) {
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

  var postToBack = function (params) {
    var deferred = $q.defer();

    $http.post('/api/users/' + Auth.getCurrentUser()._id + '/uploads', params)
    .then(function (res) {
      deferred.resolve(res.data);
    })
    .catch(console.error);

    return deferred.promise;
  };

  var getSignedUrl = function (file) {
    var deferred = $q.defer();

    $http.get('/api/s3/credential', {
      params: {
        fileName: file.name,
        fileType: file.type,
      },
    })
    .then(function (res) {
      deferred.resolve(res.data);
    })
    .catch(console.error);

    return deferred.promise;
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

  $scope.showFileDialog = function (lecture, ev) {
    $mdDialog.show({
      controller: function ($scope, $mdDialog) {
        $scope.haveUploadedFile = scope.haveUploadedFile;
        $scope.lecture = lecture;

        $scope.deleteFile = function (lecture) {
          $http.delete('/api/users/' + Auth.getCurrentUser()._id + '/uploads/' + scope.upload._id + '/lectures/' + lecture.file._id)
          .then(function () {
            delete lecture.file;
            showToast('File deleted');
          })
          .catch(console.error);
        };
        $scope.cancel = function () {
          $mdDialog.cancel();
        };
        $scope.attachFile = function (file) {
          getSignedUrl(file)
          .then(function (s3Urls) {
            return uploadFile(file, s3Urls);
          })
          .then(function (url) {
            return postToBack({
              videoId: lecture.snippet.resourceId.videoId,
              playlistId: scope.playlistId,
              url: url,
              fileName: file.name
            });
          })
          .then(function (uploaded) {
            $mdDialog.hide(uploaded);
          })
          .catch(console.error);
        };
      },
      templateUrl: 'components/dialog/attach-file.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true
    })
    .then(function (uploaded) {
      showToast('File uploaded');
      lecture.file = uploaded.lectures.filter(function (fileMeta) {
        return fileMeta.videoId === lecture.snippet.resourceId.videoId;
      })[0];
      console.log(uploaded);
    })
    .catch(console.error);
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

  $scope.selectLecture = function (lecture) {
    $scope.selectedLecture = $scope.selectedLecture === lecture ? null : lecture;
  };
  $scope.isSelectedLecture = function (lecture) {
    return $scope.selectedLecture === lecture;
  };

  $scope.deleteLecture = function () {
    $http.delete('/api/youtube/mine/playlistitems',{
      params: { playlistItemId: $scope.selectedLecture.id }
    })
    .then(function () {
      _.remove($scope.lectureList, $scope.selectedLecture);
      $scope.selectedLecture = null;
      showToast('Lecture deleted');
    })
    .catch(console.error);
  };

});

