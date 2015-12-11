(function (angular) {
  'use strict';

  angular.module('learntubeApp')
  .controller('EditLectureCtrl', EditLectureCtrl);

  function EditLectureCtrl($scope, $state) {
    $scope.playlistId = $state.params.pid;
    $scope.videoId = $state.params.vid;
  }

  EditLectureCtrl.$inject = ['$scope', '$state'];
})(angular);
