'use strict';

angular.module('learntubeApp')
.config(function ($stateProvider) {
  $stateProvider
  .state('Watched', {
    url: '/watched',
    views: {
      common: {
        templateUrl: 'app/personal/watched/watched.html',
        controller: 'WatchedContentsCtrl',
        data: { pageName: 'Watched Contents' }
      },
    },
  })
  .state('Uploaded', {
    url: '/uploaded',
    views: {
      common: {
        templateUrl: 'app/personal/uploaded/uploaded.html',
        controller: 'UploadedContentsCtrl',
        data: { pageName: 'Uploaded Contents' }
      },
    },
  });
});
