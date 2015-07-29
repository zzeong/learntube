'use strict';

angular.module('learntubeApp')
.directive('ckeditor', function() {
  return {
    restrict: 'A',
    link: function(scope, elem, attrs) {
      CKEDITOR.replace(attrs.id); 
    }
  };
});
