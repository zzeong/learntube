(function (angular) {
  'use strict';

  angular.module('learntubeApp')
  .directive('ltNoteUnit', LtNoteUnitDirective);

  function LtNoteUnitDirective() {
    return {
      scope: {
        type: '@ltNoteType',
        model: '=ltNoteModel',
      },
      restrict: 'E',
      compile: compile,
      controller: Controller,
    };

    function compile(elem) {
      elem.addClass('lt-note');
    }

    function Controller($scope) {
      this.type = $scope.type;
      this.model = $scope.model;
    }
  }


  angular.module('learntubeApp')
  .directive('ltNoteObject', ltNoteObjectDirective);

  function ltNoteObjectDirective() {
    return {
      restrict: 'E',
      require: '^ltNoteUnit',
      templateUrl: templateUrl,
      link: postLink,
    };

    function templateUrl(elem) {
      var type = elem.parent().attr('lt-note-type');
      return 'components/note/note-' + type + '.html';
    }

    function postLink(scope, elem, attr, ctrl) {
      if (ctrl.type === 'editor') {
        elem.addClass('lt-note__object--full');
      }
      scope.model = ctrl.model;
    }
  }


  angular.module('learntubeApp')
  .directive('ltNoteActions', ltNoteActionsDirective);

  function ltNoteActionsDirective() {
    return {
      restrict: 'E',
      scope: {
        onCancel: '&ltOnCancel',
        onAdd: '&ltOnAdd',
      },
      require: '^ltNoteUnit',
      templateUrl: 'components/note/note-actions.html',
      link: postLink,
    };

    function postLink(scope, elem, attr, ctrl) {
      elem.addClass('lt-note__actions');
      elem.attr({
        layout: 'row',
        'layout-align': 'start center'
      });

      scope.addNote = function () {
        var file = morphToFile(ctrl.model.obj);
        scope.onAdd({
          $type: ctrl.model.type,
          $file: file,
        });
      };

      scope.cancelNote = function () {
        ctrl.model.activator = false;
        scope.onCancel();
      };

      function morphToFile(obj) {
        return (typeof obj === 'string') ? new Blob([obj], { type: 'text/html' }) : obj;
      }
    }
  }
})(angular);
