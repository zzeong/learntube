'use strict';

angular.module('learntubeApp')
.controller('UploadedContentsCtrl', function ($state, $scope, $mdDialog, $http) {
  $http.get('/api/youtube/mine/playlists')
  .then(function (res) {
    $scope.classes = res.data.items;
  })
  .catch(console.error);

  $scope.showDialog = function (ev) {
    $mdDialog.show({
      controller: function ($scope, $mdDialog) {
        $scope.cancel = function () {
          $mdDialog.cancel();
        };
        $scope.addClass = function (classe) {
          $http.post('/api/youtube/mine/playlists', {
            resource: {
              snippet: {
                title: classe.title,
                description: classe.desc,
              },
              status: {
                privacyStatus: 'public',
              },
            },
          })
          .then(function (res) {
            $mdDialog.hide(res.data);
          })
          .catch(console.error);
        };
      },
      templateUrl: 'components/dialog/add-class.tmpl.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true
    })
    .then(function (item) {
      $scope.classes.unshift(item);
    })
    .catch(console.error);
  };

  $scope.deleteClass = function (classe) {
    $http.delete('/api/youtube/mine/playlists', {
      params: { playlistId: classe.id }
    })
    .then(function () {
      _.remove($scope.classes, classe);
    })
    .catch(console.error);
  };

});
