'use strict';

angular.module('learntubeApp')
.controller('MainCtrl', function($scope, $state) {
  $scope.go = $state.go;
});
