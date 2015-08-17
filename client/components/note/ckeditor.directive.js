'use strict';

angular.module('learntubeApp')
.directive('ckeditor', function() {
  return {
    require: '?ngModel',
    restrict: 'A',
    link: function(scope, elem, attrs, ngModel) {
      var ck = CKEDITOR.replace(elem[0]); 

      if(!ngModel) { return; }

      ck.on('instanceReady', function() {
        ck.setData(ngModel.$viewValue);
      });

      function updateModel() {
        scope.$apply(function() {
          ngModel.$setViewValue(ck.getData());
        });
      }

      ck.on('change', updateModel);
      ck.on('key', updateModel);
      ck.on('dataReady', updateModel);

      ngModel.$render = function() {
        ck.setData(ngModel.$viewValue);
      };
    }
  };
});
