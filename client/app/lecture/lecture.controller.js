'use strict';

angular.module('learntubeApp')
.controller('LectureCtrl', function($scope, $stateParams, $http, Auth) {
  $scope.videoId = $stateParams.vid;
  $http.get('https://www.googleapis.com/youtube/v3/videos', {
    params: {
      key: 'AIzaSyBUuJS30-hhEY8f_kMF3K3rX4qe_bkY3V8',
      part: 'snippet,contentDetails',
      id: $scope.videoId
    }
  }).success(function(response) {
    $scope.item = response.items[0];
  });

  $scope.isNoteOn = false;
  $scope.toggleNote = function() {
    $scope.isNoteOn = !$scope.isNoteOn; 
  };
  $scope.doneNote = function() {
    var params = {
      email: Auth.getCurrentUser().email,
      videoId: $scope.videoId,
      note: $scope.note
    };

    $http.post('/api/notes', {
      params: params
    }).success(function(response) {
      console.log(response);
    });
  };
});

