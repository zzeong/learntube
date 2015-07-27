'use strict';

angular.module('learntubeApp')
.controller('ToolbarCtrl', function ($scope, $location, $state, $window, $mdUtil, $mdSidenav, $log, Auth) {
  var path = {
    menu: '/assets/images/menu.svg',
    back: '/assets/images/back.svg',
    clear: '/assets/imags/clear.svg',
  },
  back = function() { $window.history.back(); },
  toggleLeft = buildToggler('left');


  $scope.onSearching = false;
  $scope.getCurrentUser = Auth.getCurrentUser;
  $scope.isLoggedIn = Auth.isLoggedIn;
  $scope.personalMenu = [{
    name: 'Watched Contents',
    url: '/'
  }, {
    name: 'Uploaded Contents',
    url: '/'
  }, {
    name: 'Settings',
    url: '/'
  }];
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
  $scope.getUserImgPath = function(user) {
    var guestImgPath = '/assets/images/guest.png';
    return _.has(user, 'google') ? user.google.image.url : guestImgPath;   
  };
  $scope.logout = function() {
    Auth.logout();
    $location.path('/');
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

});
