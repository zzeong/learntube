'use strict';

angular.module('learntubeApp')
.controller('UploadedContentsCtrl', function($state, $scope, $mdDialog, $log, $http) {
  $scope.go = $state.go;

  $http.get('/api/youtube/uploaded/').then(function(res) {
    $scope.classes = res.data;
  });

  $scope.showDialog = function(ev) {
    $mdDialog.show({
      controller: function($scope, $mdDialog) {
        $scope.cancel = function() {
          $mdDialog.cancel();
        };
        $scope.addClass = function(classe) {
          $http.post('/api/youtube/uploaded', {
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
            $mdDialog.hide(res.data);
          }, function(res) {
            $log.error(res); 
          });
        };
      },
      templateUrl: 'components/dialog/add-class.tmpl.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true
    })
    .then(function(item) {
      $scope.classes.unshift(item);
    }, function(res) {
      $log.error(res);
    });
  };

  $scope.deleteClass = function(classe) {
    $http.delete('/api/youtube/uploaded/' + classe.id).then(function() {
      _.remove($scope.classes, classe); 
    }, function(res) {
      $log.error(res); 
    });
  };

});
