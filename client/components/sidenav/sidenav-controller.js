'use strict';

angular.module('learntubeApp')
.controller('SidenavCtrl', function ($scope, Category, $state, $filter) {
  $scope.href = $state.href.bind(null);
  $scope.categories = Category.name;
  $scope.getSafeUrl = function (string) {
    return $filter('urlSafely')(string);
  };
});
