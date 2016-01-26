'use strict';

angular.module('learntubeApp')
.controller('SearchCtrl', function ($scope, $http, $state) {
  $scope.q = $state.params.q;
  $scope.href = $state.href.bind(null);
  $scope.classes = [];

  $http.get('/api/search', {
    params: { q: $scope.q, type: 'playlist' }
  })
  .then((res) => $scope.classes = $scope.classes.concat(res.data))
  .catch(console.error);
});
