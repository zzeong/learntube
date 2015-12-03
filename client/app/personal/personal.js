'use strict';

angular.module('learntubeApp')
.config(function ($stateProvider) {
  $stateProvider
  .state('watched-contents', {
    url: '/watched',
    templateUrl: 'app/personal/watched/watched.html',
    controller: 'WatchedContentsCtrl',
    data: { pageName: 'Watched contents' }
  })
  .state('uploaded-contents', {
    url: '/uploaded',
    templateUrl: 'app/personal/uploaded/uploaded.html',
    controller: 'UploadedContentsCtrl',
    data: { pageName: 'Uploaded contents' }
  });
});
