'use strict';

angular.module('learntubeApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngMessages',
  'ui.router',
  'ngMaterial',
  'youtube-embed',
  'angular-google-gapi',
  'file-model',
  'infinite-scroll',
  'ngFileUpload',
  'angularMoment',
  'gridshore.c3js.chart',
  'slick'
])
.config(function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
  $urlRouterProvider
  .otherwise('/');

  $locationProvider.html5Mode(true);
  $httpProvider.interceptors.push('authInterceptor');
})
.config(function ($mdThemingProvider) {
  $mdThemingProvider.theme('default')
  .primaryPalette('amber')
  .accentPalette('blue');
})

.directive('focusMe', function ($timeout) {
  return {
    link: function (scope, element, attrs) {
      scope.$watch(attrs.focusMe, function (value) {
        if (value === true) {
          $timeout(function () {
            element[0].focus();
            scope[attrs.focusMe] = false;
          });
        }
      });
    }
  };
})

.directive('myFocus', function () {
  return {
    restrict: 'A',
    link: function postLink(scope, element, attrs) {
      if (attrs.myFocus === '') {
        attrs.myFocus = 'focusElement';
      }
      scope.$watch(attrs.myFocus, function (value) {
        if (value === attrs.id) {
          element[0].focus();
        }
      });
      element.on('blur', function () {
        scope[attrs.myFocus] = '';
        scope.$apply();
      });
    }
  };
})

.directive('onLongPress', function ($timeout) {
  return {
    restrict: 'A',
    link: function ($scope, $elm, $attrs) {
      $elm.bind('touchstart', function () {
        // Locally scoped variable that will keep track of the long press
        $scope.longPress = true;

        // We'll set a timeout for 600 ms for a long press
        $timeout(function () {
          if ($scope.longPress) {
            // If the touchend event hasn't fired,
            // apply the function given in on the element's on-long-press attribute
            $scope.$apply(function () {
              $scope.$eval($attrs.onLongPress);
            });
          }
        }, 600);
      });

      $elm.bind('touchend', function () {
        // Prevent the onLongPress event from firing
        $scope.longPress = false;
        // If there is an on-touch-end function attached to this element, apply it
        if ($attrs.onTouchEnd) {
          $scope.$apply(function () {
            $scope.$eval($attrs.onTouchEnd);
          });
        }
      });
    }
  };
})

.factory('authInterceptor', function ($rootScope, $q, $cookieStore, $location, $window) {
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
    response: function (res) {
      if (/^\/api/.test(res.config.url) && res.headers('Authorization')) {
        $cookieStore.put('token', res.headers('Authorization').replace('Bearer ', ''));
      }
      return res;
    },
    // Intercept 401s and redirect you to login
    responseError: function (response) {
      if (response.status === 401) {
        $location.path('/');
        // remove any stale tokens
        $cookieStore.remove('token');
        $window.location.reload();
        return $q.reject(response);
      } else {
        return $q.reject(response);
      }
    }
  };
})

.run(function ($rootScope, $location, Auth, GApi, GAuth, GoogleConst) {
  GApi.load('youtube', 'v3');
  GAuth.setClient(GoogleConst.oauth.clientId);
  GAuth.setScope(GoogleConst.oauth.scope);

  // Redirect to login if route requires auth and you're not logged in
  $rootScope.$on('$stateChangeStart', function (event, next) {
    Auth.isLoggedInAsync(function (loggedIn) {
      if (next.authenticate && !loggedIn) {
        event.preventDefault();
        $location.path('/login');
      }
    });
  });
})

.controller('MasterCtrl', function ($scope, NavToggler, $state) {
  $scope.onSwipeRight = function (ev) {
    if (ev.pointer.startX < 15) { NavToggler.left(); }
  };
  $scope.go = $state.go;
});
