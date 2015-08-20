'use strict';

angular.module('learntubeApp')
.controller('UploadedContentsCtrl', function(GApi, GAuth, GoogleConst, $state, $scope) {
  $scope.go = $state.go;

  GAuth.login().then(function() {
    GApi.executeAuth('youtube', 'playlists.list', {
      part: 'snippet',
      mine: true,
    })
    .then(function(res) {
      $scope.classes = res.items.map(function(item) {
        return { item: item };
      });
    });
  });
});
