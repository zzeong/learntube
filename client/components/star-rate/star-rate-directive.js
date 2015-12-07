(function (angular) {
  'use strict';

  angular.module('learntubeApp')
  .directive('ltStarRate', LtStarRateDirective);

  function LtStarRateDirective() {
    return {
      restrict: 'E',
      scope: {
        ltRate: '='
      },
      templateUrl: 'components/star-rate/star-rate.html',
      link: postLink,
    };

    function postLink(scope, elem) {
      elem.addClass('star-rate');
      scope.starWidth = calcWidth(scope.ltRate);

      function calcWidth(rate) {
        return Math.round(rate) * 10;
      }
    }
  }
})(angular);

