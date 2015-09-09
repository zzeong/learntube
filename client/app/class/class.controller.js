'use strict';

angular.module('learntubeApp')
.controller('ClassCtrl', function($scope, $http, $stateParams, $state, ClassAPI, $log, Auth, $filter, GoogleConst, GApi) {
  $scope.isLoggedIn = Auth.isLoggedIn;
  $scope.playlistId = $stateParams.pid;
  $scope.go = $state.go;

  $scope.addClass = function() {
    ClassAPI.create({
      playlistId: $scope.playlistId
    }, function() {
      $log.info('Saved Lecture');
    });
  };



    // 재생목록에 대한 정보 받아오기 (title, channelTitle, description)
    $http.get('https://www.googleapis.com/youtube/v3/playlists', {
      params: {
        key: GoogleConst.browserKey,
        part: 'snippet',
        id: $scope.playlistId
      }
    }).success(function(response) {
      $scope.classe = response.items[0];
      $scope.desc = $scope.classe.snippet.description;
      $scope.channelId = $scope.classe.snippet.channelId;

      // 채널에 대한 정보 받아오기 (title, thumbnail, description)
      $http.get('https://www.googleapis.com/youtube/v3/channels', {
        params: {
          key: GoogleConst.browserKey,
          part: 'snippet',
          id: $scope.channelId
        }
      }).success(function(response) {
        $scope.channel = response.items[0];
      });


    });




    var applyDuration = function(ids) {
      return GApi.execute('youtube', 'videos.list', {
        key: GoogleConst.browserKey,
        part: 'contentDetails',
        id: ids,
        fields: 'items(contentDetails(duration))',
      });
    };


    GApi.execute('youtube', 'playlistItems.list', {
      key: GoogleConst.browserKey,
      part: 'snippet',
      maxResults: 20,
      playlistId: $scope.playlistId,
      fields: 'items(contentDetails,snippet,status),nextPageToken',
    })
    .then(function(res) {
      $scope.lectureList = res.items; 
      var ids = res.items.map(function(item) {
        return item.snippet.resourceId.videoId; 
      }).join(','); 

      return applyDuration(ids);
    })
    .then(function(res) {
      $scope.lectureList.forEach(function(item, i) {
        item.contentDetails = res.items[i].contentDetails; 
      }); 
    });

});
