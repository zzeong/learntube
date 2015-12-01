'use strict';

angular.module('learntubeApp')
.controller('CategoryAllCtrl', function ($scope, $http, Category) {

  console.log(Category);
  $scope.categories = [];
  for (var i in Category.name) {
    $scope.categories.push(Category.name[i].orig);
  }

});
