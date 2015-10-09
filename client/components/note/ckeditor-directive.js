'use strict';

angular.module('learntubeApp')
.directive('ckeditor', function () {
  return {
    require: '?ngModel',
    restrict: 'A',
    link: function (scope, elem, attrs, ngModel) {
      var ck = CKEDITOR.replace(elem[0], {
        toolbarGroups: [
          { name: 'basicstyles', groups: ['basicstyles'] },
          { name: 'links', groups: ['links'] },
          { name: 'paragraph', groups: ['list', 'blocks'] },
          { name: 'document', groups: ['mode'] },
          { name: 'insert', groups: ['insert'] },
          { name: 'styles', groups: ['styles'] },
          { name: 'about', groups: ['about'] }
        ],
        removeButtons: 'Underline,Strike,Subscript,Superscript,Anchor,Styles,Specialchar'
      });


      if (!ngModel) { return; }

      ck.on('instanceReady', function () {
        ck.setData(ngModel.$viewValue);
      });

      function updateModel() {
        scope.$apply(function () {
          ngModel.$setViewValue(ck.getData());
        });
      }

      ck.on('change', updateModel);
      ck.on('key', updateModel);
      ck.on('dataReady', updateModel);

      ngModel.$render = function () {
        ck.setData(ngModel.$viewValue);
      };
    }
  };
});
