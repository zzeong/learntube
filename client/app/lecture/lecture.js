'use strict';

angular.module('learntubeApp')
.config(function ($stateProvider) {
  $stateProvider
  .state('Lecture', {
    url: '/class/:pid/lecture/:vid',
    views: {
      classroom: {
        templateUrl: 'app/lecture/lecture.html',
        controller: 'LectureCtrl',
        data: { pageName: 'Lecture Room' }
      },
    },
  });
});
