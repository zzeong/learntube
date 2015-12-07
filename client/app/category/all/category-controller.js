'use strict';

angular.module('learntubeApp')
.controller('CategoryAllCtrl', function ($scope, $http, Category) {
  $scope.href = function (pid) { return '/class/' + pid; };

  $http.get('/api/categories/get-each-top')
  .then(function (res) {
    for (var i in res.data) {
      for (var k in Category.name) {

        if (res.data[i].categorySlug === Category.name[k].slug) {
          res.data[i].categorySlug = Category.name[k].orig;
        }

      }

      if (res.data[i].rate < 1.5) {
        res.data[i].rate = 10;
      } else if (1.5 <= res.data[i].rate && res.data[i].rate < 2.5) {
        res.data[i].rate = 20;
      } else if (2.5 <= res.data[i].rate && res.data[i].rate < 3.5) {
        res.data[i].rate = 30;
      } else if (3.5 <= res.data[i].rate && res.data[i].rate < 4.5) {
        res.data[i].rate = 40;
      } else if (4.5 <= res.data[i].rate && res.data[i].rate < 5.5) {
        res.data[i].rate = 50;
      } else if (4.5 <= res.data[i].rate && res.data[i].rate < 5.5) {
        res.data[i].rate = 50;
      } else if (5.5 <= res.data[i].rate && res.data[i].rate < 6.5) {
        res.data[i].rate = 60;
      } else if (6.5 <= res.data[i].rate && res.data[i].rate < 7.5) {
        res.data[i].rate = 70;
      } else if (7.5 <= res.data[i].rate && res.data[i].rate < 8.5) {
        res.data[i].rate = 80;
      } else if (8.5 <= res.data[i].rate && res.data[i].rate < 9.5) {
        res.data[i].rate = 90;
      } else {
        res.data[i].rate = 100;
      }

    }

    $scope.classArr = _.chunk(res.data, 5);
  })
  .catch(console.error);

});
