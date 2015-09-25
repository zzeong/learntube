'use strict';

angular.module('learntubeApp')
.factory('navToggler', function($mdUtil, $mdSidenav, $log) {
  var buildToggler =  function (navID) {
    var debounceFn =  $mdUtil.debounce(function(){
      $mdSidenav(navID)
      .toggle()
      .then(function () {
        $log.debug('toggle ' + navID + ' is done');
      });
    },200);
    return debounceFn;
  };
  var toggleLeft = buildToggler('left');

  return {
    left: toggleLeft
  };
});
