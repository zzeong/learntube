(function (angular) {
  'use strict';

  angular.module('learntubeApp')
  .directive('ltClass', LtClassDirective);

  function LtClassDirective() {
    return {
      restrict: 'E'
    };
  }
})(angular);
