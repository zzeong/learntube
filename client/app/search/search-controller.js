'use strict';

angular.module('learntubeApp')
.controller('SearchCtrl', function ($scope, $http, $state) {
  $scope.q = $state.params.q;
  $scope.href = $state.href.bind(null);

  $http.get('/api/search', {
    params: { q: $scope.q, type: 'playlist' }
  })
  .then((res) => $scope.classes = res.data)
  .catch(console.error);
});
