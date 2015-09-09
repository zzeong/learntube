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

      $scope.totalPlaytime=0;

      // 동영상 번호 부여 (오래된 동영상 -> 최근 동영상)
      for(var i=0; i<$scope.lectureList.length; i++){
        $scope.lectureList[i].index = i+1;
        // 동영상 비교하기 위한 속성 부여
        $scope.lectureList[i].highlight = false;

        // duration에 humanable filter적용
        $scope.lectureList[i].contentDetails.duration = $filter('humanable')($scope.lectureList[i].contentDetails.duration);

        // duration을 split
        var durationSplit = $scope.lectureList[i].contentDetails.duration.split(':');

        // 분, 초를 모두 합해 totalPlaytime계산
        $scope.totalPlaytime += parseInt(durationSplit[0])*60 + parseInt(durationSplit[1]);
      }

      // 실제 시, 분, 초 구하기
      $scope.playtimeHour = parseInt($scope.totalPlaytime/3600);
      $scope.playtimeMin = parseInt(($scope.totalPlaytime%3600)/60);
      $scope.playtimeSec = parseInt(($scope.totalPlaytime%3600)%60);

      // index가 마지막인 영상의 ID
      $scope.firstVideoId = $scope.lectureList[$scope.lectureList.length-1].snippet.resourceId.videoId;

    });



});
