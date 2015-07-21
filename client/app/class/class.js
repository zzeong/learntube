'use strict';

angular.module('learntubeApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('Summary', {
        url: '/class/:cid',
        templateUrl: 'app/class/class.html',
        controller: 'ClassCtrl'
      });
  });
