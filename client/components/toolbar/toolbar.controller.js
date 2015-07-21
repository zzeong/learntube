'use strict';

angular.module('learntubeApp')
  .controller('ToolbarCtrl', function ($scope, $location, $state, $window) {
    var path = {
      menu: '/assets/images/menu.svg',
      back: '/assets/images/back.svg',
    }

    $scope.leftIconChanger = function() {
      return $state.current.url === '/' ? path.menu : path.back;
    };
    $scope.back = function() {
      $window.history.back(); 
    };
  });
