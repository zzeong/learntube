'use strict';

angular.module('learntubeApp')
.controller('SearchCtrl', function($scope, $http, $stateParams) {
  $scope.q = $stateParams.q;

  $http.get('https://www.googleapis.com/youtube/v3/search', {
    params: {
      key: 'AIzaSyBUuJS30-hhEY8f_kMF3K3rX4qe_bkY3V8',
      part: 'snippet',
      q: $scope.q,
      type: 'playlist',
      maxResults: 20
    }
  }).success(function(response) {
    $scope.classes = response.items; 
  });
});
