'use strict';

angular.module('learntubeApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('Lecture', {
        url: '/class/:pid/lecture/:vid',
        templateUrl: 'app/lecture/lecture.html',
        controller: 'LectureCtrl'
      });
  });
