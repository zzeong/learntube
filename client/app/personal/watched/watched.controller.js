'use strict';

angular.module('learntubeApp')
.controller('WatchedContentsCtrl', function($scope, $http, ClassAPI, $state, GoogleConst, GApi) {
  $scope.go = $state.go;

  ClassAPI.query(function(response) {
    $scope.classes = response; 

    var playlistIds = $scope.classes.map(function(el) {
      return el.playlistId;
    }).join(',');

    GApi.execute('youtube', 'playlists.list', {
      key: GoogleConst.browserKey,
      part: 'snippet',
      id: playlistIds,
      fields: 'items(snippet(title,thumbnails))',
    })
    .then(function(responseFromYT) {
      $scope.classes = $scope.classes.map(function(classe, i) {
        classe.item = responseFromYT.items[i];
        return classe;
      });
    });
  });

  $scope.deleteClass = function(classe) {
    ClassAPI.remove({ cid: classe._id }, function() {
        _.remove($scope.classes, classe);
    });
  };
});
