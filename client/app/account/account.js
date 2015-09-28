'use strict';

angular.module('learntubeApp')
.config(function ($stateProvider) {
  $stateProvider
  .state('Login', {
    url: '/login',
    templateUrl: 'app/account/login/login.html',
    controller: 'LoginCtrl'
  })
  .state('Sign up', {
    url: '/signup',
    templateUrl: 'app/account/signup/signup.html',
    controller: 'SignupCtrl'
  });
});
