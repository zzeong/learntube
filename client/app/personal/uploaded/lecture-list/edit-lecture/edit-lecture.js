'use strict';

angular.module('learntubeApp')
.config(function ($stateProvider) {
  $stateProvider.state('edit-lecture', {
    url: '/uploaded/classes/:pid/lectures/:vid/edit',
    templateUrl: 'app/personal/uploaded/lecture-list/edit-lecture/edit-lecture.html',
    controller: 'EditLectureCtrl',
    data: { pageName: 'Edit lecture' }
  });
});
