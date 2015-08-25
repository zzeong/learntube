'use strict';

angular.module('learntubeApp')
.controller('UploadedLectureListCtrl', function($scope, $stateParams, Auth, $state, $http) {
  $scope.playlistId = $stateParams.pid;

  if(!Auth.isLoggedIn()) { $state.go('Login'); }

  $http.get('/api/youtube/lecture-list', {
    params: {
      playlistId: $scope.playlistId,
    }, 
  }).then(function(res) {
    $scope.lectureList = res.data;
  });

});
