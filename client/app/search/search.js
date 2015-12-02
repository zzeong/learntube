'use strict';

angular.module('learntubeApp')
.config(function ($stateProvider) {
  $stateProvider
  .state('Search', {
    url: '/search/:q',
    templateUrl: 'app/search/search.html',
    controller: 'SearchCtrl',
    data: { pageName: 'Search' }
  });
});
