'use strict';

angular.module('learntubeApp')
.controller('ToolbarCtrl', function ($scope, $location, $state, $window) {
  var path = {
    menu: '/assets/images/menu.svg',
    back: '/assets/images/back.svg',
  };


  $scope.stateNameCheck = function(name) {
    return $state.current.name === name;
  };

  $scope.title = $scope.stateNameCheck('Search') ? $state.params.q : $state.current.name;

  $scope.leftIconChanger = function() {
    return $scope.stateNameCheck('Home') ? path.menu : path.back;
  };

  $scope.back = function() { $window.history.back(); };
})
.config(function($mdThemingProvider){
  // Configure a dark theme with primary foreground yellow
  $mdThemingProvider.theme('docs-dark', 'default')
  .primaryPalette('yellow')
  .dark();
});
