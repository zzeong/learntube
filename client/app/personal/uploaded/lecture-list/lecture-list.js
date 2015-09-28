'use strict';

angular.module('learntubeApp')
.config(function ($stateProvider) {
  $stateProvider.state('UploadedLectureList', {
    url: '/uploaded/lecture-list/:pid',
    templateUrl: 'app/personal/uploaded/lecture-list/lecture-list.html',
    controller: 'UploadedLectureListCtrl',
  });
});
