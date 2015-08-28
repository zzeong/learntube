'use strict';

angular.module('learntubeApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngMessages',
  'btford.socket-io',
  'ui.router',
  'ngMaterial',
  'youtube-embed',
  'angular-google-gapi',
  'file-model'
])
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');
  })
  .config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
    .primaryPalette('cyan')
    .accentPalette('lime');  
  })

  .directive('focusMe', function($timeout) {
    return {
      link: function(scope, element, attrs) {
        scope.$watch(attrs.focusMe, function(value) {
          if(value === true) {
            $timeout(function() {
              element[0].focus(); 
              scope[attrs.focusMe] = false;
            });
          }
        }); 
      } 
    }; 
  })

  .factory('authInterceptor', function ($rootScope, $q, $cookieStore, $location) {
    return {
      // Add authorization token to headers
      request: function (config) {
        var isExternalReq = /^http/.test(config.url);
        config.headers = config.headers || {};
        if ($cookieStore.get('token') && !isExternalReq) {
          config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
        }
        return config;
      },

      // Intercept 401s and redirect you to login
      responseError: function(response) {
        if(response.status === 401) {
          $location.path('/login');
          // remove any stale tokens
          $cookieStore.remove('token');
          return $q.reject(response);
        }
        else {
          return $q.reject(response);
        }
      }
    };
  })

  .run(function ($rootScope, $location, Auth, GApi, GAuth, GoogleConst) {
    GApi.load('youtube','v3');
    GAuth.setClient(GoogleConst.oauth.clientId);
    GAuth.setScope(GoogleConst.oauth.scope);

    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$stateChangeStart', function (event, next) {
      Auth.isLoggedInAsync(function(loggedIn) {
        if (next.authenticate && !loggedIn) {
          event.preventDefault();
          $location.path('/login');
        }
      });
    });
  });
