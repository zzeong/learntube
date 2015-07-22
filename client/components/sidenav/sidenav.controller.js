'use strict';

angular.module('learntubeApp')
.controller('SidenavCtrl', function ($scope, $mdSidenav, $log) {
  $scope.close = function () {
    $mdSidenav('left').close().then(function () {
      $log.debug("close LEFT is done");
    });
  };
});
