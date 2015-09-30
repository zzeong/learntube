'use strict';

angular.module('learntubeApp')
.config(function ($stateProvider) {
  $stateProvider.state('WatchedLectureList', {
    url: '/watched/lecture-list/:pid',
    templateUrl: 'app/personal/watched/lecture-list/lecture-list.html',
    controller: 'WatchedLectureListCtrl',
    data: { pageName: 'Lecture List' }
  });
});
