'use strict';

angular.module('learntubeApp')
.factory('ToolbarService', function () {
  var classTitle;

  return {
    getClassTitle: function () {
      return classTitle;
    },

    setClassTitle: function (classe) {
      classTitle = classe.title;
      return classTitle;
    }
  };

});
