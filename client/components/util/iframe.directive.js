'use strict';

angular.module('learntubeApp')
.directive('foofoo', function () {
  return {
    restrict: 'A',
    scope: {
      bar: '@',
    },
    link: function (scope, elem, attrs) {
      iFrameResize({}, elem[0]);
    }
  };
});
