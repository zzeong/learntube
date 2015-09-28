'use strict';

angular.module('learntubeApp')
.controller('MainCtrl', function ($scope, $state, GApi, GoogleConst, $http) {
  $scope.go = $state.go;

  $http.get('/api/classes/get-tops', {
    params: { num: 6 }
  })
  .then(function (res) {
    var params = {
      key: GoogleConst.browserKey,
      part: 'snippet',
      id: res.data.map(function (d) { return d.playlistId; }).join(','),
      maxResults: 20
    };

    return GApi.execute('youtube', 'playlists.list', params);
  })
  .then(function (res) {
    $scope.classes = res.items;
  });
});
