'use strict';

angular.module('learntubeApp')
.config(function ($stateProvider) {
  $stateProvider
  .state('classroom', {
    url: '/classes/:pid/lectures/:vid',
    templateUrl: 'app/classroom/classroom.html',
    controller: 'ClassroomCtrl',
    data: { pageName: 'Classroom' },
  });
});
