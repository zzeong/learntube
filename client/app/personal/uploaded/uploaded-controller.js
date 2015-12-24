(function (angular) {
  'use strict';

  angular.module('learntubeApp')
  .controller('UploadedContentsCtrl', UploadedContentsCtrl);

  function UploadedContentsCtrl($state, $scope, $mdDialog, $http) {
    $scope.href = $state.href;
    $scope.showAddDialog = showAddDialog;
    $scope.showDeleteDialog = showDeleteDialog;
    $scope.deleteClass = deleteClass;

    $http.get('/api/youtube/mine/playlists')
    .then((res) => {
      $scope.classes = res.data.items;
    })
    .catch(console.error);

    function showAddDialog(ev) {
      $mdDialog.show({
        controller: Controller,
        templateUrl: 'components/dialog/add-class.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true
      })
      .then((item) => {
        $scope.classes.unshift(item);
      })
      .catch(console.error);

      function Controller($scope, $mdDialog, Category) {
        $scope.cancel = $mdDialog.cancel;
        $scope.addClass = addClass;
        $scope.categories = Category.name;

        function addClass(classe) {
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
            extras: {
              categorySlug: classe.slug,
            },
          })
          .then((res) => {
            $mdDialog.hide(res.data);
          })
          .catch(console.error);
        }
      }
    }

    function showDeleteDialog(ev, classe) {
      ev.preventDefault();

      var confirm = $mdDialog.confirm()
      .title('Delete the class')
      .textContent('Are you sure?')
      .ariaLabel('Delete the class')
      .targetEvent(ev)
      .ok('Ok')
      .cancel('Cancel');

      $mdDialog.show(confirm)
      .then(() => { $scope.deleteClass(classe); });
    }

    function deleteClass(classe) {
      $http.delete('/api/youtube/mine/playlists', {
        params: { playlistId: classe.id }
      })
      .then(() => { _.remove($scope.classes, classe); })
      .catch(console.error);
    }
  }

  UploadedContentsCtrl.$inject = ['$state', '$scope', '$mdDialog', '$http'];
})(angular);
