'use strict';

angular.module('learntubeApp')
.controller('ClassCtrl', function($scope, $http, $stateParams) {
  $http.get('https://www.googleapis.com/youtube/v3/playlists', {
    params: {
      key: 'AIzaSyBUuJS30-hhEY8f_kMF3K3rX4qe_bkY3V8',
      part: 'snippet',
      id: $stateParams.cid
    }
  }).success(function(response) {
    $scope.classe = response.items[0];
    console.log($scope.classe);
  });
});
