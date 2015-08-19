'use strict';

angular.module('learntubeApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('lecture-list', {
        url: '/lecture-list/:pid',
        templateUrl: 'app/personal/watched/lecture-list/lecture-list.html',
        controller: 'LectureListCtrl'
      });
  });
