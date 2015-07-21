'use strict';

angular.module('learntubeApp')
.controller('ToolbarCtrl', function ($scope, $location, $state, $window) {
  var path = {
    menu: '/assets/images/menu.svg',
    back: '/assets/images/back.svg',
    clear: '/assets/imags/clear.svg',
  };

  $scope.onSearching = false;
  $scope.toggleSearchingState = function() {
    $scope.onSearching = !$scope.onSearching; 
    $scope.focusInput = true;
  };
  $scope.stateNameCheck = function(name) { return $state.current.name === name; };
  $scope.title = $scope.stateNameCheck('Search') ? $state.params.q : $state.current.name;
  $scope.leftIconChanger = function() {
    return $scope.stateNameCheck('Home') ? path.menu : path.back;
  };
  $scope.back = function() { $window.history.back(); };
  $scope.goSearch = function() { $state.go('Search', { q: $scope.q }); };
})
.config(function($mdThemingProvider){
  // Configure a dark theme with primary foreground yellow
  $mdThemingProvider.theme('docs-dark', 'default')
  .primaryPalette('yellow')
  .dark();
});
