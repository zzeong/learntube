'use strict';

angular.module('learntubeApp')
.controller('LectureCtrl', function($scope, $stateParams, $http, Auth, NoteAPI, $log) {
  $scope.videoId = $stateParams.vid;
  $scope.playlistId = $stateParams.pid;
  $scope.playerVars = {
    listType: 'playlist',
    list: $scope.playlistId
  };
  $scope.isNoteOn = false;
  $scope.getCurrentUser = Auth.getCurrentUser;
  $scope.isLoggedIn = Auth.isLoggedIn;

  $http.get('https://www.googleapis.com/youtube/v3/videos', {
    params: {
      key: 'AIzaSyBUuJS30-hhEY8f_kMF3K3rX4qe_bkY3V8',
      part: 'snippet,contentDetails',
      id: $scope.videoId
    }
  }).success(function(response) {
    $scope.item = response.items[0];
  });

  if($scope.isLoggedIn()) {
    NoteAPI.query({ videoId: $scope.videoId }, function(notes) {
      $scope.notes = notes;
    });
  }

  $scope.completeLecture = function() {
    $http.post('/api/users/' + $scope.getCurrentUser()._id + '/classes/', {
      userId: $scope.getCurrentUser()._id
    }).success(function(response) {
      var classe = response;
      $http.post('/api/users/' + $scope.getCurrentUser()._id + '/classes/' + classe._id + '/lectures/', {
        videoId: $scope.videoId
      }).success(function() {
        $log.info('Saved Lecture');  
      });
    });
  };

  $scope.toggleNote = function() {
    $scope.isNoteOn = !$scope.isNoteOn; 
  };

  $scope.doneNote = function() {
    var params = {
      videoId: $scope.videoId,
      contents: $scope.note
    };

    NoteAPI.create(params, function() {
    });
  };


  $scope.getUserImgPath = function(user) {
    var guestImgPath = '/assets/images/guest.png';
    return _.has(user, 'google') ? user.google.image.url : guestImgPath;   
  };
});

