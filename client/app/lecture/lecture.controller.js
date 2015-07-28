'use strict';

angular.module('learntubeApp')
.controller('LectureCtrl', function($scope, $stateParams) {
  $scope.videoId = $stateParams.vid;
});

