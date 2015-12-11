'use strict';

angular.module('learntubeApp')
.controller('CategoryAllCtrl', function ($scope, $http, Category, $state) {
  $scope.href = $state.href.bind(null);

  $http.get('/api/categories/get-each-top')
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
  .catch(console.error);

});
