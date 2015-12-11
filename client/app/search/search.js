'use strict';

angular.module('learntubeApp')
.config(function ($stateProvider) {
  $stateProvider
  .state('search', {
    url: '/searched/:q',
    templateUrl: 'app/search/search.html',
    controller: 'SearchCtrl',
    data: { pageName: 'Search' }
  });
});
