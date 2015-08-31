'use strict';

angular.module('learntubeApp')
.controller('ClassCtrl', function($scope, $http, $stateParams, $state, ClassAPI, $log, Auth) {
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
    // console.log($scope.lectureList);

    // lecArrSorting구성
    $scope.lecArrSorting = _.sortBy($scope.lectureList, function(el){
      return el.snippet.publishedAt;
    });



    // 동영상 번호 부여 (오래된 동영상 -> 최근 동영상)
    for(var i=0; i<$scope.lecArrSorting.length; i++){
      $scope.lecArrSorting[i].index = i+1;
      // 동영상 비교하기 위한 속성 부여
      $scope.lecArrSorting[i].highlight = false;
    }

    // index가 마지막인 영상의 ID
    $scope.firstVideoId = $scope.lecArrSorting[$scope.lecArrSorting.length-1].snippet.resourceId.videoId;

  });



    // show function구현
    //var change = true;
    $scope.show = false;
    $scope.show2 = false;
    $scope.content = 'view more';
    $scope.content2 = 'view more';


    // javascript에서는 primitive type의 parameter를 받았을 때,
    // 그것을 참조하는 것이 아니라 '복사' 하기 때문에 showProp으로
    // 다르게 받았다.
    $scope.changeDesc = function(contentProp, showProp) {
      $scope[showProp] = !$scope[showProp];

      if ($scope[showProp] === false) {
        $scope[contentProp] = 'view more';
      } else {
        $scope[contentProp] = 'view less';
      }
      return $scope[showProp];

    };

  });
