'use strict';

angular.module('learntubeApp')
.controller('CategoryAllCtrl', function ($scope, $http, Category) {

  Object.defineProperty(Array.prototype, 'chunk_inefficient', {
    value: function (chunkSize) {
      var array = this;
      return [].concat.apply([],
        array.map(function (elem, i) {
          return i % chunkSize ? [] : [array.slice(i, i + chunkSize)];
        })
      );
    }
  });

  $http.get('/api/categories/get-each-top')
  .then(function (res) {
    for (var i in res.data) {
      for (var k in Category.name) {
        if (res.data[i].categorySlug === Category.name[k].slug) {
          res.data[i].categorySlug = Category.name[k].orig;
        }
      }
    }

    $scope.classArr = res.data.chunk_inefficient(5);
  })
  .catch(console.error);

});
