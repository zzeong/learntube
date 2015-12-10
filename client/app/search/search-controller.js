'use strict';

angular.module('learntubeApp')
.controller('SearchCtrl', function ($scope, $http, $stateParams, GApi, GoogleConst) {
  $scope.q = $stateParams.q;
  $scope.httpBusy = true;
  $scope.href = function (pid) { return '/class/' + pid; };

  var params = {
    key: GoogleConst.browserKey,
    part: 'snippet',
    q: $scope.q,
    type: 'playlist',
    maxResults: 20,
  };

  GApi.execute('youtube', 'search.list', params)
  .then(function (res) {
    $scope.classes = res.items;
    $scope.pageToken = res.nextPageToken || null;
    $scope.httpBusy = false;
  })
  .catch(console.error);

  $scope.loadMore = function (token) {
    $scope.httpBusy = true;
    params.pageToken = token;

    GApi.execute('youtube', 'search.list', params)
    .then(function (res) {
      $scope.classes = $scope.classes.concat(res.items);
      $scope.pageToken = res.nextPageToken || null;
      $scope.httpBusy = false;
    })
    .catch(console.error);
  };

});
