'use strict';

angular.module('learntubeApp')
.config(function ($stateProvider) {
  $stateProvider
  .state('class-summary', {
    url: '/classes/:pid',
    templateUrl: 'app/class-summary/class-summary.html',
    controller: 'ClassSummaryCtrl',
    data: { pageName: 'Class summary' }
  });
});
