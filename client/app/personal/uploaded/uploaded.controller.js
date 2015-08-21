'use strict';

angular.module('learntubeApp')
.controller('UploadedContentsCtrl', function(GApi, GAuth, GoogleConst, $state, $scope, $mdDialog, $log) {
  $scope.go = $state.go;

  GAuth.login().then(function() {
    GApi.executeAuth('youtube', 'playlists.list', {
      part: 'snippet',
      mine: true,
    })
    .then(function(res) {
      $scope.classes = res.items.map(function(item) {
        return { item: item };
      });
    });
  });

  $scope.showAdvanced = function(ev) {
    $mdDialog.show({
      controller: function($scope, $mdDialog) {
        $scope.cancel = function() {
          $mdDialog.cancel();
        };
        $scope.addClass = function(classe) {
          GApi.executeAuth('youtube', 'playlists.insert', {
            part: 'snippet,status',
            resource: {
              snippet: {
                title: classe.title,
                description: classe.desc,
              },
              status: {
                privacyStatus: 'public',
              },
            },
          }).then(function(res) {
            $mdDialog.hide(res);
          });
        };
      },
      templateUrl: 'components/dialog/add-class.tmpl.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true
    })
    .then(function(res) {
      $scope.classes.unshift({ item: res });
    });
  };

});
