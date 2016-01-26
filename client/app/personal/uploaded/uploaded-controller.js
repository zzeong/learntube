(function (angular) {
  'use strict';

  angular.module('learntubeApp')
  .controller('UploadedContentsCtrl', UploadedContentsCtrl);

  function UploadedContentsCtrl($state, $scope, $mdDialog, $http, $window) {
    $scope.href = $state.href;
    $scope.showAddDialog = showAddDialog;
    $scope.showDeleteDialog = showDeleteDialog;
    $scope.deleteClass = deleteClass;
    $scope.hasChannel = true;

    $http.get('/api/classes', {
      params: { mine: true },
    })
    .then((res) => {
      $scope.classes = res.data;
    })
    .catch((err) => {
      if (_.has(err.data, 'message') && _.isEqual(err.data.message, 'channelNotFound')) {
        $scope.hasChannel = false;
        return showConfirmDialog();
      }
      console.error(err);
    });

    function showConfirmDialog() {
      var confirm = $mdDialog.confirm()
      .title('Would you like to create your channel on YouTube?')
      .textContent('If you want to serve classes to other users, you have to create at least 1 channel.')
      .ok('Confirm')
      .cancel('Cancel');

      $mdDialog.show(confirm)
      .then(() => $window.open('https://www.youtube.com/create_channel'))
      .catch(() => $window.history.back());
    }

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
          $http.post('/api/classes', {
            title: classe.title,
            description: classe.desc,
            categorySlug: classe.slug,
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
      $http.delete(`/api/classes/${classe._id}`)
      .then(() => _.remove($scope.classes, classe))
      .catch(console.error);
    }

  }

  UploadedContentsCtrl.$inject = ['$state', '$scope', '$mdDialog', '$http', '$window'];
})(angular);
