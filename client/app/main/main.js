'use strict';

angular.module('learntubeApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('Home', {
        url: '/',
        templateUrl: 'app/main/main.html',
        //controller: 'MainCtrl'
        controller: 'AppCtrl'
      });
  });
