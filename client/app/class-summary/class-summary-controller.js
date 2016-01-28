(function () {
  'use strict';

  angular.module('learntubeApp')
  .controller('ClassSummaryCtrl', ClassSummaryCtrl);

  function ClassSummaryCtrl($scope, $http, $state, WatchedContent, Auth, $filter, $mdToast, LoadMore) {
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.playlistId = $state.params.pid;
    $scope.haveClass = false;
    $scope.href = $state.href;
    $scope.addClass = addClass;
    $scope.showToast = showToast;
    $scope.lectures = [];
    $scope.fetchLectures = fetchLectures;

    $scope.reqLectures = LoadMore.createRequest('/api/lectures', (data) => {
      let p = _.pick($scope, 'playlistId');
      return _.has(data, 'nextPageToken') ? _.set(p, 'pageToken', data.nextPageToken) : p;
    });

    $scope.fetchLectures($scope.reqLectures);

    // 재생목록에 대한 정보 받아오기 (title, channelTitle, description)
    $http.get('/api/classes', {
      params: { playlistId: $scope.playlistId }
    })
    .then((res) => {
      $scope.classe = _.first(res.data.items);
      $scope.desc = compileToHTML($scope.classe.description);

      return $http.get('/api/tutors', {
        params: _.pick($scope.classe, 'channelId')
      });
    })
    .then((res) => {
      $scope.channel = _.first(res.data);
      $scope.channel.description = compileToHTML($scope.channel.description);
    })
    .catch((e) => console.error(e));

    if ($scope.isLoggedIn()) {
      WatchedContent.get().$promise
      .then((res) => {
        $scope.haveClass = _.find(res.items, (item) => {
          return item._class.playlistId === $scope.playlistId;
        }) ? true : false;
      })
      .catch((e) => console.error(e));
    }

    function addClass() {
      WatchedContent.create({
        playlistId: $scope.playlistId
      }).$promise
      .then(function () {
        $scope.haveClass = true;
        $scope.showToast('Class is added');
      })
      .catch((e) => console.error(e));
    }

    function showToast(text) {
      $mdToast.show(
        $mdToast.simple()
        .content(text)
        .position('bottom right')
        .hideDelay(3000)
      );
    }

    function compileToHTML(str = '') {
      return str.split('\n')
      .filter((p) => p.length)
      .map((p) => `<p>${p}</p>`)
      .join('');
    }

    function fetchLectures(req) {
      return req()
      .then((res) => {
        $scope.lectures = $scope.lectures.concat(res.data.items);
        $scope.existNextLectures = _.has(res.data, 'nextPageToken');
      })
      .catch((err) => console.error(err));
    }
  }

  ClassSummaryCtrl.$inject = [
    '$scope',
    '$http',
    '$state',
    'WatchedContent',
    'Auth',
    '$filter',
    '$mdToast',
    'LoadMore'
  ];
})();
