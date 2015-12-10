'use strict';

angular.module('learntubeApp')
.controller('ClassSummaryCtrl', function ($scope, $http, $stateParams, $state, WatchedContent, Auth, $filter, GoogleConst, GApi, $q, $mdToast, $document, PlaylistItem) {
  $scope.isLoggedIn = Auth.isLoggedIn;
  $scope.playlistId = $stateParams.pid;
  $scope.httpBusy = true;
  $scope.getPageToken = PlaylistItem.getPageToken;
  $scope.haveClass = false;
  $scope.href = function (vid) { return '/class/' + $scope.playlistId + '/lecture/' + vid; };

  var compileToHTML = function (str) {
    var html = str.split('\n')
    .filter(function (p) { return p.length; })
    .map(function (p) { return '<p>' + p + '</p>'; })
    .join('');

    return html;
  };

  $scope.addClass = function () {
    WatchedContent.create({
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
      $scope.lectureList.map(function (obj) {
        GApi.execute('youtube', 'videos.list', {
          key: GoogleConst.browserKey,
          part: 'statistics',
          id: obj.snippet.resourceId.videoId
        })
        .then(function (res) {
          obj.viewCount = {
            viewCount: res.items[0].statistics.viewCount
          };
        })
        .catch(console.error);
      });

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
    WatchedContent.query().$promise
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
    $scope.lectureList.map(function (obj) {
      GApi.execute('youtube', 'videos.list', {
        key: GoogleConst.browserKey,
        part: 'statistics',
        id: obj.snippet.resourceId.videoId
      })
      .then(function (res) {
        obj.viewCount = {
          viewCount: res.items[0].statistics.viewCount
        };
      })
      .catch(console.error);
    });


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
