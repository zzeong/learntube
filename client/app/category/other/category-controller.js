(function (angular) {
  'use strict';

  angular.module('learntubeApp')
  .controller('CategoryOtherCtrl', CategoryOtherCtrl);

  function CategoryOtherCtrl($scope, $state, Category, $filter, $http, LoadMore) {
    $scope.href = $state.href;
    $scope.classes = {};
    $scope.fetchClasses = fetchClasses;

    $scope.category = _.find(Category.name, (name) => {
      return _.isEqual($filter('urlSafely')(name.orig), $state.params.ctname);
    });

    $scope.classes = {
      byRating: {
        items: [],
        existNext: false,
        request: LoadMore.createRequest('/api/classes', (data) => {
          let p = {
            categorySlug: $scope.category.slug,
            orderBy: 'rating'
          };
          return _.has(data, 'nextPage') ? _.set(p, 'page', data.nextPage) : p;
        })
      },
      byViews: {
        items: [],
        existNext: false,
        request: LoadMore.createRequest('/api/classes', (data) => {
          let p = {
            categorySlug: $scope.category.slug,
            orderBy: 'views'
          };
          return _.has(data, 'nextPage') ? _.set(p, 'page', data.nextPage) : p;
        })
      }
    };


    $scope.fetchClasses($scope.classes.byRating);
    $scope.fetchClasses($scope.classes.byViews);

    function fetchClasses(classObj) {
      return classObj.request()
      .then((res) => {
        classObj.items = classObj.items.concat(res.data.items);
        classObj.existNext = _.has(res.data, 'nextPage');
        console.log(classObj.existNext);
      })
      .catch((err) => console.error(err));
    }
  }

  CategoryOtherCtrl.$inject = ['$scope', '$state', 'Category', '$filter', '$http', 'LoadMore'];
})(angular);
