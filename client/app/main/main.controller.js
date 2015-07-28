'use strict';

angular.module('learntubeApp')
.controller('MainCtrl', function($scope, $state) {

  $scope.goSearch = function() {
    $state.go('Search', { q: $scope.q });
  };
});
