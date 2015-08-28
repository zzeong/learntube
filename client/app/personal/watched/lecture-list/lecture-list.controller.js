'use strict';

angular.module('learntubeApp')
.controller('WatchedLectureListCtrl', function($scope, $stateParams, Auth, $state, $http, $log, ClassAPI) {
  $scope.playlistId = $stateParams.pid;

  if(!Auth.isLoggedIn()) { $state.go('Login'); }

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

    // DB에서 시청한 동영상 목록 가져오기 (SeenLectures)
    ClassAPI.query({playlistId: $scope.playlistId}, function(response){
      $scope.SeenLectures = response[0].lectures; // response = json형태의 lectures

      // Highlight처리를 ㅜ이한 비교 (전체 동영상 목록 <=> DB상의 동영상 목록)
      for(var i=0; i<$scope.lecArrSorting.length; i++){
        for(var s=0; s<$scope.SeenLectures.length; s++){
          if($scope.lecArrSorting[i].snippet.resourceId.videoId === $scope.SeenLectures[s].videoId){
            $scope.lecArrSorting[i].highlight = true;
          }
        }
      }
    console.log($scope.lecArrSorting);
    }, function(err){
      $log.error(err);
    });

  });

});










