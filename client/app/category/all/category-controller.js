'use strict';

angular.module('learntubeApp')
.controller('CategoryAllCtrl', function ($scope, $http, Category, $state, $filter) {
  $scope.href = $state.href;

  $http.get('/api/classes/get-each-category')
  .then(function (res) {
    for (var i in res.data) {
      for (var k in Category.name) {

        if (res.data[i].categorySlug === Category.name[k].slug) {
          res.data[i].categorySlug = Category.name[k].orig;
        }

      }
    }

    $scope.classArr = _.chunk(res.data, 5);
  })
  .catch((e) => console.error(e));

  $scope.getSafeUrl = function (string) {
    return $filter('urlSafely')(string);
  };

});
