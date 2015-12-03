'use strict';

angular.module('learntubeApp')
.config(function ($stateProvider) {
  $stateProvider
  .state('home', {
    url: '/',
    templateUrl: 'app/home/home.html',
    controller: 'HomeCtrl',
    data: { pageName: 'Home' }
  });
});
