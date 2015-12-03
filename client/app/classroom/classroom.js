'use strict';

angular.module('learntubeApp')
.config(function ($stateProvider) {
  $stateProvider
  .state('classroom', {
    url: '/class/:pid/lecture/:vid',
    templateUrl: 'app/classroom/classroom.html',
    controller: 'ClassroomCtrl',
    data: { pageName: 'Classroom' },
  });
});
