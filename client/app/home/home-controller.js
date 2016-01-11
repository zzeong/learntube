'use strict';

angular.module('learntubeApp')
.controller('HomeCtrl', function ($scope, $window, $state, GApi, GoogleConst, $http) {
  const CARD_WIDTH = 230 + 8 * 2;
  $scope.href = $state.href;
  $scope.popularClasses = null;
  $scope.slick = {};

  $scope.scrollPosition = 0;
  $scope.changeToYellow = false;
  $scope.setBackground = '{ background: none }';

  $scope.slick.responsive = _.times(4).reverse().map((i) => {
    return {
      breakpoint: CARD_WIDTH * (i + 2),
      settings: {
        slidesToShow: i + 1
      }
    };
  });

  $http.get('/api/classes/get-tops', {
    params: { num: 8 }
  })
  .then(function (res) {
    var params = {
      key: GoogleConst.browserKey,
      part: 'snippet',
      id: res.data.map((d) => { return d.playlistId; }).join(','),
      maxResults: 20
    };

    return GApi.execute('youtube', 'playlists.list', params);
  })
  .then(function (res) {
    $scope.popularClasses = res.items;
  })
  .catch(console.error);

  $scope.changeToYellow = false;

});
