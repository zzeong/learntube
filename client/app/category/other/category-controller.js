(function (angular) {
  'use strict';

  angular.module('learntubeApp')
  .controller('CategoryOtherCtrl', CategoryOtherCtrl);

  function CategoryOtherCtrl($scope, $state, Category, $filter, $http) {
    $scope.href = $state.href;
    $scope.category = _.find(Category.name, (name) => {
      return _.isEqual($filter('urlSafely')(name.orig), $state.params.ctname);
    });

    $http.get('/api/categories', { params: { slug: $scope.category.slug } })
    .then((res) => { $scope.classes = res.data; });
  }

  CategoryOtherCtrl.$inject = ['$scope', '$state', 'Category', '$filter', '$http'];
})(angular);
