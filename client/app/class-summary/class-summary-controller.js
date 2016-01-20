(function () {
  'use strict';

  angular.module('learntubeApp')
  .controller('ClassSummaryCtrl', ClassSummaryCtrl);

  function ClassSummaryCtrl($scope, $http, $state, WatchedContent, Auth, $filter, GoogleConst, GApi, $q, $mdToast, $document, PlaylistItem) {
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.playlistId = $state.params.pid;
    $scope.getPageToken = PlaylistItem.getPageToken;
    $scope.haveClass = false;
    $scope.href = $state.href;
    $scope.addClass = addClass;
    $scope.showToast = showToast;

    // 재생목록에 대한 정보 받아오기 (title, channelTitle, description)
    $http.get('/api/classes', {
      params: { playlistId: $scope.playlistId }
    })
    .then((res) => {
      $scope.classe = res.data[0];
      $scope.desc = compileToHTML($scope.classe.description);
      $scope.channelId = $scope.classe.channelId;

      return GApi.execute('youtube', 'channels.list', {
        key: GoogleConst.browserKey,
        part: 'snippet',
        id: $scope.channelId
      });
    })
    .then((res) => {
      $scope.channel = res.items[0];
      $scope.channel.snippet.description = compileToHTML($scope.channel.snippet.description);
    })
    .catch(console.error);

    if ($scope.isLoggedIn()) {
      WatchedContent.query().$promise
      .then((items) => {
        $scope.haveClass = _.find(items, (item) => {
          return item._class.playlistId === $scope.playlistId;
        }) ? true : false;
      })
      .catch(console.error);
    }

    PlaylistItem.get({ playlistId: $scope.playlistId }, {
      initialToken: true,
    })
    .then(function (list) {
      $scope.lectureList = list;
    })
    .catch(console.error);

    function addClass() {
      WatchedContent.create({
        playlistId: $scope.playlistId
      }).$promise
      .then(function () {
        $scope.haveClass = true;
        $scope.showToast('Class is added');
      })
      .catch(console.error);
    }

    function showToast(text) {
      $mdToast.show(
        $mdToast.simple()
        .content(text)
        .position('bottom right')
        .hideDelay(3000)
      );
    }

    function compileToHTML(str) {
      return str.split('\n')
      .filter((p) => p.length)
      .map((p) => `<p>${p}</p>`)
      .join('');
    }
  }

  ClassSummaryCtrl.$inject = [
    '$scope',
    '$http',
    '$state',
    'WatchedContent',
    'Auth',
    '$filter',
    'GoogleConst',
    'GApi',
    '$q',
    '$mdToast',
    '$document',
    'PlaylistItem'
  ];
})();
