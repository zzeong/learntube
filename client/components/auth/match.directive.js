'use strict';

angular.module('learntubeApp')
.directive('match', function ($parse) {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, elem, attrs, ctrl) {
      scope.$watch(function () {
        return $parse(attrs.match)(scope) === ctrl.$modelValue;
      }, function (currentValue) {
        ctrl.$setValidity('mismatch', currentValue);
      });
    }
  };
});
