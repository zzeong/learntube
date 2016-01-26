(function () {
  'use strict';

  angular.module('learntubeApp')
  .controller('WatchedContentsCtrl', WatchedContentsCtrl);

  function WatchedContentsCtrl($scope, $http, WatchedContent, $state, $mdDialog) {
    $scope.href = $state.href;
    $scope.showConfirmDialog = showConfirmDialog;
    $scope.contents = null;

    WatchedContent.query().$promise
    .then((res) => {
      $scope.contents = res.map((ctt) => {
        ctt.watchingRatio = ctt.lectures.length / ctt._class.videoCount;
        return ctt;
      });
    })
    .catch(console.error);

    function showConfirmDialog(content, ev) {
      var confirm = $mdDialog.confirm()
      .title('Delete the class')
      .textContent('Are you sure?')
      .ariaLabel('Delete the class')
      .targetEvent(ev)
      .ok('Ok')
      .cancel('Cancel');

      $mdDialog.show(confirm)
      .then(deleteClass);

      function deleteClass() {
        WatchedContent.remove({ cid: content._id }).$promise
        .then(function () {
          _.remove($scope.contents, content);
        })
        .catch(console.error);
      }

      ev.preventDefault();
    }

  }

  WatchedContentsCtrl.$inject = [
    '$scope',
    '$http',
    'WatchedContent',
    '$state',
    '$mdDialog'
  ];
})();
