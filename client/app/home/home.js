'use strict';

angular.module('learntubeApp')
.config(function ($stateProvider) {
  $stateProvider
  .state('Home', {
    url: '/',
    views: {
      common: {
        templateUrl: 'app/home/home.html',
        controller: 'HomeCtrl',
        data: { pageName: 'Home' }
      },
    },
  });
});
