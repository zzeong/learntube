'use strict';

angular.module('learntubeApp')
.config(function ($stateProvider) {
  $stateProvider
  .state('search', {
    url: '/search/:q',
    templateUrl: 'app/search/search.html',
    controller: 'SearchCtrl',
    data: { pageName: 'Search' }
  });
});
