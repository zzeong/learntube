'use strict';

angular.module('learntubeApp')
.config(function ($stateProvider) {
  $stateProvider.state('uploaded-lecture-list', {
    url: '/uploaded/classes/:pid',
    templateUrl: 'app/personal/uploaded/lecture-list/lecture-list.html',
    controller: 'UploadedLectureListCtrl',
    data: { pageName: 'Uploaded lecture list' }
  });
});
