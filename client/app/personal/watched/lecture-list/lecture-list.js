'use strict';

angular.module('learntubeApp')
.config(function ($stateProvider) {
  $stateProvider.state('watched-lecture-list', {
    url: '/watched/classes/:pid',
    templateUrl: 'app/personal/watched/lecture-list/lecture-list.html',
    controller: 'WatchedLectureListCtrl',
    data: { pageName: 'Watched lecture list' }
  });
});
