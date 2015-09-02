'use strict';

angular.module('learntubeApp')
.controller('WatchedLectureListCtrl', function($scope, $stateParams, Auth, $state, $http, $log, ClassAPI, $filter, NoteAPI) {
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
      $scope.lecArrSorting[i].noteIconVisible = false;

      // duration에 humanable filter적용
      $scope.lecArrSorting[i].contentDetails.duration = $filter('humanable')($scope.lecArrSorting[i].contentDetails.duration);

    }



    // DB에서 시청한 동영상 목록 가져오기 (SeenLectures)
    ClassAPI.query({playlistId: $scope.playlistId}, function(response){
      var SeenLectures = response[0].lectures; // response = json형태의 lectures

      // Highlight처리를 위한 비교 (전체 동영상 목록 <=> DB상의 동영상 목록)
      for(var i=0; i<$scope.lecArrSorting.length; i++){
        for(var s=0; s<SeenLectures.length; s++){
          if($scope.lecArrSorting[i].snippet.resourceId.videoId === SeenLectures[s].videoId){
            $scope.lecArrSorting[i].highlight = true;
          }
        }
      }
    console.log($scope.lecArrSorting);
    }, function(err){
      $log.error(err);
    });


    // DB에서 필기 목록 가져오기 (Note)
    NoteAPI.meta({playlistId: $scope.playlistId}, function(response){
      console.log(response);

      var NotenLectures = [];
      for(var i=0; i<response.length; i++){
        NotenLectures[i] = response[i].videoId;
      }

      for(var i=0; i<$scope.lecArrSorting.length; i++){
        for(var s=0; s<NotenLectures.length; s++){
          if($scope.lecArrSorting[i].snippet.resourceId.videoId === NotenLectures[s]){
            $scope.lecArrSorting[i].noteIconVisible = true;
          }
        }
      }



    }, function(err){
      $log.error(err);
    });

  });

});

