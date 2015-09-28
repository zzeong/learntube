'use strict';

angular.module('learntubeApp')
.controller('ClassCtrl', function ($scope, $http, $stateParams, $state, ClassAPI, $log, Auth, $filter, GoogleConst, GApi, $q) {
  $scope.isLoggedIn = Auth.isLoggedIn;
  $scope.playlistId = $stateParams.pid;
  $scope.go = $state.go;
  $scope.httpBusy = true;

  $scope.addClass = function () {
    ClassAPI.create({
      playlistId: $scope.playlistId
    }, function () {
      $log.info('Saved Lecture');
    });
  };

  $scope.loadMore = function (token) {
    $scope.httpBusy = true;

    GApi.execute('youtube', 'playlistItems.list', {
      key: GoogleConst.browserKey,
      part: 'snippet',
      maxResults: 20,
      playlistId: $scope.playlistId,
      fields: 'items(contentDetails,snippet,status),nextPageToken',
      pageToken: token
    })
    .then(function (res) {
      $scope.pageToken = res.nextPageToken || null;
      return applyDuration(res.items);
    })
    .then(function (list) {
      $scope.lectureList = $scope.lectureList.concat(list);
      $scope.httpBusy = false;
    });
  };




  // 재생목록에 대한 정보 받아오기 (title, channelTitle, description)
  GApi.execute('youtube', 'playlists.list', {
    key: GoogleConst.browserKey,
    part: 'snippet',
    id: $scope.playlistId
  })
  .then(function (res) {
    $scope.classe = res.items[0];
    $scope.desc = $scope.classe.snippet.description;
    $scope.channelId = $scope.classe.snippet.channelId;

    return GApi.execute('youtube', 'channels.list', {
      key: GoogleConst.browserKey,
      part: 'snippet',
      id: $scope.channelId
    });
  })
  .then(function (res) {
    $scope.channel = res.items[0];
  });


  var applyDuration = function (list) {
    var deferred = $q.defer();
    var ids = list.map(function (item) {
      return item.snippet.resourceId.videoId;
    }).join(',');

    GApi.execute('youtube', 'videos.list', {
      key: GoogleConst.browserKey,
      part: 'contentDetails',
      id: ids,
      fields: 'items(contentDetails(duration))',
    }).then(function (response) {
      list.forEach(function (item, i) {
        item.contentDetails = response.items[i].contentDetails;
      });
      deferred.resolve(list);
    }, deferred.reject);

    return deferred.promise;
  };


  GApi.execute('youtube', 'playlistItems.list', {
    key: GoogleConst.browserKey,
    part: 'snippet',
    maxResults: 20,
    playlistId: $scope.playlistId,
    fields: 'items(contentDetails,snippet,status),nextPageToken',
  })
  .then(function (res) {
    console.log(res);
    $scope.pageToken = res.nextPageToken || null;
    return applyDuration(res.items);
  })
  .then(function (list) {
    $scope.lectureList = list;
    $scope.httpBusy = false;
  });



});
