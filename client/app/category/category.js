'use strict';

angular.module('learntubeApp')
.config(function ($stateProvider) {
  $stateProvider
  .state('category-all', {
    url: '/categories/all',
    templateUrl: 'app/category/all/category.html',
    controller: 'CategoryAllCtrl',
    data: { pageName: 'Categories' }
  })
  .state('category-other', {
    url: '/categories/:ctname',
    templateUrl: 'app/category/other/category.html',
    controller: 'CategoryOtherCtrl',
    data: { pageName: 'Categories' }
  });
});
