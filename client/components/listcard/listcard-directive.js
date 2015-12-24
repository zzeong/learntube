(function (angular) {
  'use strict';

  angular.module('learntubeApp')
  .directive('ltListcard', LtClassDirective);

  function LtClassDirective() {
    return {
      restrict: 'E',
      scope: {
        responsiveMorph: '=ltResponsiveMorph',
        scaleDown: '=ltScaleDown',
      },
      link: postLink,
    };

    function postLink(scope, elem) {
      if (scope.responsiveMorph) { elem.addClass('lt-listcard--morph'); }
      if (scope.scaleDown) { elem.addClass('lt-listcard--small'); }
    }
  }


  angular.module('learntubeApp')
  .directive('ltListcardMedia', LtListcardMedia);

  function LtListcardMedia() {
    return {
      restrict: 'E'
    };
  }


  angular.module('learntubeApp')
  .directive('ltListcardContent', LtListcardContent);

  function LtListcardContent() {
    return {
      restrict: 'E',
      transclude: true,
      template: '<div class="lt-listcard__info-box" ng-transclude></div>',
    };
  }

  angular.module('learntubeApp')
  .directive('ltListcardActions', LtListcardActions);

  function LtListcardActions() {
    return {
      restrict: 'E',
      compile: compile,
    };

    function compile(elem) {
      elem.addClass('lt-listcard-actions');
    }
  }
})(angular);
