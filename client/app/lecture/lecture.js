'use strict';

angular.module('learntubeApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('Lecture', {
        url: '/class/:cid/lecture/:lid',
        templateUrl: 'app/lecture/lecture.html',
        controller: 'LectureCtrl'
      });
  });
