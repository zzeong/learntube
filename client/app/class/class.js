'use strict';

angular.module('learntubeApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('Summary', {
        url: '/class/:pid',
        templateUrl: 'app/class/class.html',
        controller: 'ClassCtrl'
      });
  });
