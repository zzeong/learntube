'use strict';

angular.module('learntubeApp')
.controller('WatchedContentsCtrl', function($scope, $http, ClassAPI) {
  ClassAPI.query(function(response) {
    $scope.myClasses = response; 

    var playlistIds = $scope.myClasses.map(function(el) {
      return el.playlistId;
    }).join(',');

    $http.get('https://www.googleapis.com/youtube/v3/playlists', {
      params: {
        key: 'AIzaSyBUuJS30-hhEY8f_kMF3K3rX4qe_bkY3V8',
        part: 'snippet',
        id: playlistIds,
        fields: 'items(snippet(title,thumbnails))',
      }
    }).success(function(responseFromYT) {
      $scope.classes = responseFromYT.items;
    });

  });
});
