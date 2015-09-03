'use strict';

angular.module('learntubeApp')
.controller('ToolbarCtrl', function ($scope, $location, $state, $window, $mdUtil, $mdSidenav, $log, Auth) {
  var buildToggler =  function (navID) {
    var debounceFn =  $mdUtil.debounce(function(){
      $mdSidenav(navID)
      .toggle()
      .then(function () {
        $log.debug('toggle ' + navID + ' is done');
      });
    },200);
    return debounceFn;
  };

  var back = function() { $window.history.back(); };
  var toggleLeft = buildToggler('left');


  $scope.onSearching = false;
  $scope.getCurrentUser = Auth.getCurrentUser;
  $scope.isLoggedIn = Auth.isLoggedIn;
  $scope.personalMenu = [{
    name: 'Watched Contents',
    url: '/watched',
  }, {
    name: 'Uploaded Contents',
    url: '/uploaded',
  }, {
    name: 'Settings',
    url: '/',
  }];
  $scope.toggleSearchingState = function() {
    $scope.onSearching = !$scope.onSearching; 
    $scope.focusInput = true;
  };
  $scope.stateNameCheck = function(name) { return $state.current.name === name; };
  $scope.title = $scope.stateNameCheck('Search') ? $state.params.q : $state.current.name;
  $scope.goSearch = function() { $state.go('Search', { q: $scope.q }); };
  $scope.leftTrigger = function() {
    var func = $scope.stateNameCheck('Home') ? toggleLeft : back;
    func();
  };
  $scope.getUserImgPath = function(user) {
    var guestImgPath = '/assets/images/guest.png';
    return _.has(user, 'google') ? user.google.image.url : guestImgPath;   
  };
  $scope.logout = function() {
    Auth.logout();
    $location.path('/');
  };

  
});
