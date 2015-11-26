'use strict';

angular.module('learntubeApp')
.controller('ToolbarCtrl', function ($scope, $location, $state, $window, Auth, navToggler) {
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
    name: 'Watched contents',
    url: '/watched',
  }, {
    name: 'Uploaded contents',
    url: '/uploaded',
  }];
  $scope.toggleSearchingState = function () {
    $scope.onSearching = !$scope.onSearching;
    $scope.focusInput = true;
  };
  $scope.stateNameCheck = function (name) { return $state.current.name === name; };
  $scope.title = getMobileTitle();
  $scope.mainIconTrigger = function () {
    navToggler.left();
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
