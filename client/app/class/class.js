'use strict';

angular.module('learntubeApp')
.config(function ($stateProvider) {
  $stateProvider
  .state('Summary', {
    url: '/class/:pid',
    views: {
      common: {
        templateUrl: 'app/class/class.html',
        controller: 'ClassCtrl',
        data: { pageName: 'Class Summary' }
      },
    },
  });
});
