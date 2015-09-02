'use strict';

angular.module('learntubeApp')
.controller('ClassCtrl', function($scope, $http, $stateParams, $state, ClassAPI, $log, Auth, $filter) {
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
        key: 'AIzaSyBUuJS30-hhEY8f_kMF3K3rX4qe_bkY3V8',
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
          key: 'AIzaSyBUuJS30-hhEY8f_kMF3K3rX4qe_bkY3V8',
          part: 'snippet',
          id: $scope.channelId
        }
      }).success(function(response) {
        $scope.channel = response.items[0];
      });


    });






    // 강의들을 가져오기 위한 api사용
    $http.get('/api/youtube/lecture-list',{
      params:{
        playlistId: $scope.playlistId,
      },
    }).then(function(res){

      $scope.lectureList = res.data;

    // lecArrSorting구성
    $scope.lecArrSorting = _.sortBy($scope.lectureList, function(el){
      return el.snippet.publishedAt;
    });


    $scope.totalPlaytime=0;

    // 동영상 번호 부여 (오래된 동영상 -> 최근 동영상)
    for(var i=0; i<$scope.lecArrSorting.length; i++){
      $scope.lecArrSorting[i].index = i+1;
      // 동영상 비교하기 위한 속성 부여
      $scope.lecArrSorting[i].highlight = false;

      // duration에 humanable filter적용
      $scope.lecArrSorting[i].contentDetails.duration = $filter('humanable')($scope.lecArrSorting[i].contentDetails.duration);

      // duration을 split
      var durationSplit = $scope.lecArrSorting[i].contentDetails.duration.split(':');

      // 분, 초를 모두 합해 totalPlaytime계산
      $scope.totalPlaytime += parseInt(durationSplit[0])*60 + parseInt(durationSplit[1]);
    }

    // 실제 시, 분, 초 구하기
    $scope.playtimeHour = parseInt($scope.totalPlaytime/3600);
    $scope.playtimeMin = parseInt(($scope.totalPlaytime%3600)/60);
    $scope.playtimeSec = parseInt(($scope.totalPlaytime%3600)%60);

    // index가 마지막인 영상의 ID
    $scope.firstVideoId = $scope.lecArrSorting[$scope.lecArrSorting.length-1].snippet.resourceId.videoId;

  });



});
