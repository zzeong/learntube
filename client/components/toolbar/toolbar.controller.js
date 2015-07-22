'use strict';

angular.module('learntubeApp')
.controller('ToolbarCtrl', function ($scope, $location, $state, $window, $mdUtil, $mdSidenav, $log) {
  var path = {
    menu: '/assets/images/menu.svg',
    back: '/assets/images/back.svg',
    clear: '/assets/imags/clear.svg',
  };

  var back = function() { $window.history.back(); },
  toggleLeft = buildToggler('left');

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
  $scope.goSearch = function() { $state.go('Search', { q: $scope.q }); };
  $scope.leftTrigger = function() {
    $scope.stateNameCheck('Home') ? toggleLeft() : back();
  };

  /**
   * Build handler to open/close a SideNav; when animation finishes
   * report completion in console
   */
  function buildToggler(navID) {
    var debounceFn =  $mdUtil.debounce(function(){
      $mdSidenav(navID)
      .toggle()
      .then(function () {
        $log.debug("toggle " + navID + " is done");
      });
    },200);
    return debounceFn;
  }

})
.config(function($mdThemingProvider){
  // Configure a dark theme with primary foreground yellow
  $mdThemingProvider.theme('docs-dark', 'default')
  .primaryPalette('yellow')
  .dark();
});
