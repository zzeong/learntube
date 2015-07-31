'use strict';

angular.module('learntubeApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('Lecture', {
        url: '/lecture/:lid',
        templateUrl: 'app/lecture/lecture.html',
        controller: 'LectureCtrl'
      });
  });
