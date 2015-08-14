'use strict';

angular.module('learntubeApp')
.controller('SidenavDrawerCtrl', function($scope, Auth, $location) {
  $scope.isLoggedIn = Auth.isLoggedIn;
  $scope.isAdmin = Auth.isAdmin;
  $scope.getCurrentUser = Auth.getCurrentUser;
  $scope.personalMenu = [{
    name: 'Watched Contents',
    url: '/watched'
  }, {
    name: 'Uploaded Contents',
    url: '/'
  }, {
    name: 'Settings',
    url: '/'
  }];

  $scope.logout = function() {
    Auth.logout();
    $location.path('/');
  };

  $scope.isActive = function(route) {
    return route === $location.path();
  };

  $scope.getUserImage = function() {
    var guestImgPath = '/assets/images/guest.png';
    return _.has($scope.getCurrentUser(), 'google') ? $scope.getCurrentUser().google.image.url : guestImgPath;
  };

  $scope.navTo = function(url) {
    $location.path(url);
  };
})
.controller('SidenavCtrl', function ($scope, $mdSidenav, $log) {
  $scope.close = function () {
    $mdSidenav('left').close().then(function () {
      $log.debug('close LEFT is done');
    });
  };
});
