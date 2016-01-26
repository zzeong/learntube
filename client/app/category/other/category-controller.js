(function (angular) {
  'use strict';

  angular.module('learntubeApp')
  .controller('CategoryOtherCtrl', CategoryOtherCtrl);

  function CategoryOtherCtrl($scope, $state, Category, $filter, $http) {
    $scope.href = $state.href;
    $scope.classes = {};
    $scope.category = _.find(Category.name, (name) => {
      return _.isEqual($filter('urlSafely')(name.orig), $state.params.ctname);
    });

    $http.get('/api/classes', { params: {
      categorySlug: $scope.category.slug,
      orderBy: 'rating'
    }})
    .then((res) => {
      $scope.classes.byRating = res.data;
    });

    $http.get('/api/classes', { params: {
      categorySlug: $scope.category.slug,
      orderBy: 'views'
    }})
    .then((res) => {
      $scope.classes.byViews = res.data;
    });
  }

  CategoryOtherCtrl.$inject = ['$scope', '$state', 'Category', '$filter', '$http'];
})(angular);
