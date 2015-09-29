'use strict';

angular.module('learntubeApp')
.controller('ToolbarCtrl', function ($scope, $location, $state, $window, Auth, navToggler) {
  var back = function () { $window.history.back(); };

  $scope.loginOauth = function (provider) {
    $window.location.href = '/auth/' + provider;
  };

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
  $scope.toggleSearchingState = function () {
    $scope.onSearching = !$scope.onSearching;
    $scope.focusInput = true;
  };
  $scope.stateNameCheck = function (name) { return $state.current.name === name; };
  $scope.title = $scope.stateNameCheck('Search') ? $state.params.q : $state.current.name;
  $scope.goSearch = function () { $state.go('Search', { q: $scope.q }); };
  $scope.leftTrigger = function () {
    var func = $scope.stateNameCheck('Home') ? navToggler.left : back;
    func();
  };
  $scope.getUserImgPath = function (user) {
    var guestImgPath = '/assets/images/guest.png';
    return _.has(user, 'google') ? user.google.image.url : guestImgPath;
  };
  $scope.logout = function () {
    Auth.logout();
    $location.path('/');
  };


});
