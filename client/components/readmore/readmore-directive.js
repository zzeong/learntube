'use strict';

angular.module('learntubeApp')
.directive('hmRead', function () {
  return {
    restrict: 'AE',
    scope: {
      hmtext: '@',
      hmlimit: '@',
      hmfulltext: '@',
      hmMoreText: '@',
      hmLessText: '@',
      hmMoreClass: '@',
      hmLessClass: '@'
    },
    templateUrl: 'components/readmore/readmore.html',
    transclude: true,
    controller: function ($scope) {
      $scope.toggleValue = function () {
        $scope.hmfulltext = !$scope.hmfulltext;
      };
    }
  };
});
