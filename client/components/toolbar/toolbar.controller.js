'use strict';

angular.module('learntubeApp')
.controller('ToolbarCtrl', function ($scope, $location, $state, $window) {
  var curUrl = $state.current.url,
    path = {
    menu: '/assets/images/menu.svg',
    back: '/assets/images/back.svg',
  };


  $scope.title = $state.current.name;

  $scope.isHome = function() {
    return curUrl === '/' ? true : false;
  };
  $scope.leftIconChanger = function() {
    return $scope.isHome() ? path.menu : path.back;
  };
  $scope.back = function() {
    $window.history.back(); 
  };
})
.config( function($mdThemingProvider){
  // Configure a dark theme with primary foreground yellow
  $mdThemingProvider.theme('docs-dark', 'default')
  .primaryPalette('yellow')
  .dark();
});
