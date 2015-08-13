'use strict';

angular.module('learntubeApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('Watched', {
        url: '/watched',
        templateUrl: 'app/personal/watched/watched.html',
        controller: 'WatchedContentsCtrl'
      });
  });
