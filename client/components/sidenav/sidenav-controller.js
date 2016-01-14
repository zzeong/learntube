'use strict';

angular.module('learntubeApp')
.controller('SidenavCategoryCtrl', SidenavCategoryCtrl);

function SidenavCategoryCtrl($scope, Category, $state, $filter) {
  $scope.href = $state.href.bind(null);
  $scope.categories = Category.name;
  $scope.getSafeUrl = function (string) {
    return $filter('urlSafely')(string);
  };
}
