'use strict';

angular.module('learntubeApp')
.config(function ($stateProvider) {
  $stateProvider
  .state('Home', {
    url: '/',
    templateUrl: 'app/home/home.html',
    controller: 'HomeCtrl',
    data: {
      title: 'Home'
    },
  });
});
