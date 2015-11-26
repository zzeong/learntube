'use strict';

angular.module('learntubeApp')
.controller('SidenavCtrl', function ($scope, Category) {
  $scope.categories = Category.name;
});
