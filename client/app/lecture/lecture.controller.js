'use strict';

angular.module('learntubeApp')
.controller('LectureCtrl', function($scope, $stateParams, $http, Auth, Note, $log) {
  $scope.videoId = $stateParams.lid;
  $scope.isNoteOn = false;
  $scope.getCurrentUser = Auth.getCurrentUser;

  $http.get('https://www.googleapis.com/youtube/v3/videos', {
    params: {
      key: 'AIzaSyBUuJS30-hhEY8f_kMF3K3rX4qe_bkY3V8',
      part: 'snippet,contentDetails',
      id: $scope.videoId
    }
  }).success(function(response) {
    $scope.item = response.items[0];
  });

  var noteId = Note.prototype.getNoteId($scope.videoId);
  if(noteId) {
    Note.get({ nid: noteId }, function(response) {
      $log.info(response); 
      $scope.contents = response.contents;
    });
  }

  $scope.completeLecture = function() {
    $http.post('/api/users/' + $scope.getCurrentUser()._id + '/classes/', {
      userId: $scope.getCurrentUser()._id
    }).success(function(response) {
      console.log(response);
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

    Note.create(params, function(response) {
      $log.info(response); 
    });
  };

  $scope.getUserImgPath = function(user) {
    var guestImgPath = '/assets/images/guest.png';
    return _.has(user, 'google') ? user.google.image.url : guestImgPath;   
  };
});

