'use strict';

angular.module('learntubeApp')
.directive('noteViewer', function() {
  return {
    restrict: 'E',
    scope: {
      contents: '=' 
    },
    template: '<iframe></iframe>',
    link: function(scope, elem) {
      var $iframe = elem.find('iframe');
      $iframe.css({
        border: 'none',
        width: '100%'
      });
      scope.$watch('contents', function() {
        $iframe.contents().find('body').html(scope.contents);
      });
    }
  };  
});
