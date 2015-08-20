'use strict';

angular.module('learntubeApp')
.config(function($stateProvider) {
  $stateProvider.state('UploadedLectureList', {
    url: '/lecture-list/:pid',
    templateUrl: 'app/personal/uploaded/lecture-list/lecture-list.html',
    controller: 'UploadedLectureList',
  });
});
