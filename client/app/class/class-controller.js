'use strict';

angular.module('learntubeApp')
.controller('ClassCtrl', function ($scope, $http, $stateParams, $state, Class, Auth, $filter, GoogleConst, GApi, $q, $mdToast, $document, PlaylistItem) {
  $scope.isLoggedIn = Auth.isLoggedIn;
  $scope.playlistId = $stateParams.pid;
  $scope.httpBusy = true;
  $scope.getPageToken = PlaylistItem.getPageToken;
  $scope.haveClass = false;

  var compileToHTML = function (str) {
    var html = str.split('\n')
    .filter(function (p) { return p.length; })
    .map(function (p) { return '<p>' + p + '</p>'; })
    .join('');

    return html;
  };

  $scope.addClass = function () {
    Class.create({
      playlistId: $scope.playlistId
    }).$promise
    .then(function () {
      $scope.haveClass = true;
      $scope.showSimpleToast();
    })
    .catch(console.error);
  };

  $scope.loadMore = function () {
    $scope.httpBusy = true;

    PlaylistItem.get({ playlistId: $scope.playlistId })
    .then(function (list) {
      $scope.lectureList = $scope.lectureList.concat(list);
      $scope.httpBusy = false;
    })
    .catch(console.error);
  };

  // 재생목록에 대한 정보 받아오기 (title, channelTitle, description)
  GApi.execute('youtube', 'playlists.list', {
    key: GoogleConst.browserKey,
    part: 'snippet',
    id: $scope.playlistId
  })
  .then(function (res) {
    $scope.classe = res.items[0];
    //$scope.desc = $scope.classe.snippet.description;
    $scope.desc = compileToHTML($scope.classe.snippet.description);
    $scope.channelId = $scope.classe.snippet.channelId;

    return GApi.execute('youtube', 'channels.list', {
      key: GoogleConst.browserKey,
      part: 'snippet',
      id: $scope.channelId
    });
  })
  .then(function (res) {
    $scope.channel = res.items[0];
    $scope.channel.snippet.description = compileToHTML($scope.channel.snippet.description);
  })
  .catch(console.error);

  if ($scope.isLoggedIn()) {
    Class.query().$promise
    .then(function (items) {
      for (var i = 0; i < items.length; i++) {
        if (items[i].playlistId === $scope.playlistId) {
          $scope.haveClass = true;
          break;
        }
      }
    })
    .catch(console.error);
  }

  PlaylistItem.get({ playlistId: $scope.playlistId }, {
    initialToken: true,
  })
  .then(function (list) {
    $scope.lectureList = list;
    $scope.httpBusy = false;
  })
  .catch(console.error);

  $scope.showSimpleToast = function () {

    var positionArr = 'top right';

    $mdToast.show(
      $mdToast.simple()
        .content('Class is added')
        .position(positionArr)
        .hideDelay(3000)
    );
  };

});
