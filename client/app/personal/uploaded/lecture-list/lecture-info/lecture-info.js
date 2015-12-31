'use strict';

angular.module('learntubeApp')
.config(function ($stateProvider) {
  $stateProvider.state('lecture-info', {
    url: '/uploaded/classes/:pid/lectures/:vid/edit',
    templateUrl: 'app/personal/uploaded/lecture-list/lecture-info/lecture-info.html',
    controller: 'LectureInfoCtrl',
    data: { pageName: 'Lecture info' }
  });
});
