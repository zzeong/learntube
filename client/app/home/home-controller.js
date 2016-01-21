'use strict';

angular.module('learntubeApp')
.controller('HomeCtrl', function ($scope, $window, $state, $http) {
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
    $scope.popularClasses = res.data;
  })
  .catch(console.error);

  $scope.changeToYellow = false;

});
