'use strict';

angular.module('learntubeApp')
.config(function ($stateProvider) {
  $stateProvider
  .state('Category all', {
    url: '/category/all',
    views: {
      common: {
        templateUrl: 'app/category/all/category.html',
        controller: 'CategoryAllCtrl',
        data: { pageName: 'Categories' }
      },
    },
  })
  .state('Category other', {
    url: '/category/:ctname',
    views: {
      common: {
        templateUrl: 'app/category/other/category.html',
        controller: 'CategoryOtherCtrl',
        data: { pageName: 'Categories' }
      },
    },
  });
});
