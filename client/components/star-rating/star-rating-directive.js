(function (angular) {
  'use strict';

  angular.module('learntubeApp')
  .directive('ltStarRating', LtStarRatingDirective);

  function LtStarRatingDirective() {
    return {
      restrict: 'E',
      scope: {
        ltRating: '='
      },
      templateUrl: 'components/star-rating/star-rating.html',
      link: postLink,
    };

    function postLink(scope, elem) {
      elem.addClass('star-rating');
      scope.starWidth = calcWidth(scope.ltRating);

      function calcWidth(rating) {
        return Math.round(rating) * 10;
      }
    }
  }
})(angular);

