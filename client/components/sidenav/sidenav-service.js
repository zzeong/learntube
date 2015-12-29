(function (angular) {
  'use strict';

  angular.module('learntubeApp')
  .factory('NavToggler', NavToggler);

  function NavToggler($mdUtil, $mdSidenav, $log) {
    return {
      left: buildToggler('left'),
      right: buildToggler('right'),
    };

    function buildToggler(navID) {
      return $mdUtil.debounce(() => {
        $mdSidenav(navID)
        .toggle()
        .then(() => {
          $log.debug('toggle ' + navID + ' is done');
        });
      }, 200);
    }
  }
})(angular);
