(function () {
  'use strict';

  angular.module('learntubeApp')
  .controller('WatchedContentsCtrl', WatchedContentsCtrl);

  function WatchedContentsCtrl($scope, $http, $state, $mdDialog, LoadMore, Auth) {
    $scope.href = $state.href;
    $scope.showConfirmDialog = showConfirmDialog;
    $scope.fetchContents = fetchContents;
    $scope.contents = [];
    $scope.existNextContents = false;

    $scope.reqContents = LoadMore.createRequest(`/api/users/${Auth.getCurrentUser()._id}/watched-contents`, (data) => {
      return _.has(data, 'nextPage') ? _.set({}, 'page', data.nextPage) : {};
    });

    $scope.fetchContents($scope.reqContents);

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
        .catch((e) => console.error(e));
      }

      ev.preventDefault();
    }

    function fetchContents(req) {
      return req()
      .then((res) => {
        $scope.contents = $scope.contents.concat(res.data.items.map((ctt) => {
          ctt.watchingRatio = ctt.lectures.length / ctt._class.videoCount;
          return ctt;
        }));
        $scope.existNextContents = _.has(res.data, 'nextPage');
      })
      .catch((err) => console.error(err));
    }
  }

  WatchedContentsCtrl.$inject = [
    '$scope',
    '$http',
    '$state',
    '$mdDialog',
    'LoadMore',
    'Auth'
  ];
})();
