'use strict';

angular.module('learntubeApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('Lecture', {
        url: '/lecture/:vid',
        templateUrl: 'app/lecture/lecture.html',
        controller: 'LectureCtrl'
      });
  });
