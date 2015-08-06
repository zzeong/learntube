'use strict';

angular.module('learntubeApp')
.controller('LectureCtrl', function($scope, $stateParams, $http, Auth, Note, $log) {
  $scope.videoId = $stateParams.lid;
  $scope.isNoteOn = false;

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
  Note.get({ nid: noteId }, function(response) {
    $log.info(response); 
  });

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
});

