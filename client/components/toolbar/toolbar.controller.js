'use strict';

angular.module('learntubeApp')
.controller('ToolbarCtrl', function ($scope, $location, $state, $window, Auth, navToggler) {
  var back = function () { $window.history.back(); };
  var getMobileTitle = function () {
    var title = _.has($state.current, 'data') ? $state.current.data.pageName : '';
    title = $scope.stateNameCheck('Search') ? $state.params.q : title;
    return title;
  };

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
  $scope.title = getMobileTitle();
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
