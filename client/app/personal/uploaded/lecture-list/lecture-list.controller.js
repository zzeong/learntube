'use strict';

angular.module('learntubeApp')
.controller('UploadedLectureListCtrl', function($scope, $stateParams, Auth, $state, $http, $log) {
  $scope.playlistId = $stateParams.pid;


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

});
