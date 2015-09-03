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



    // DB에서 시청한 동영상 목록 가져오기 (seenLectures)
    ClassAPI.query({playlistId: $scope.playlistId}, function(response){
      var seenLectures = response[0].lectures; // response = json형태의 lectures

      // Highlight처리를 위한 비교
      for(var i=0; i<$scope.lecArrSorting.length; i++){
        for(var s=0; s<seenLectures.length; s++){
          if($scope.lecArrSorting[i].snippet.resourceId.videoId === seenLectures[s].videoId){
            $scope.lecArrSorting[i].highlight = true;
          }
        }
      }
    }, function(err){
      $log.error(err);
    });


    // DB에서 필기 목록 가져오기 (Note)
    NoteAPI.meta({playlistId: $scope.playlistId}, function(response){

      var notenLectures = [];
      for(var i=0; i<response.length; i++){
        notenLectures[i] = response[i].videoId;
      }

      // 필기 아이콘 처리를 위한 비교
      for(var k=0; k<$scope.lecArrSorting.length; k++){
        for(var s=0; s<notenLectures.length; s++){
          if($scope.lecArrSorting[k].snippet.resourceId.videoId === notenLectures[s]){
            $scope.lecArrSorting[k].noteIconVisible = true;
          }
        }
      }
    }, function(err){
      $log.error(err);
    });

    $scope.showNote = function(lecture) {
      $scope.selectedLecture = lecture;
      if(_.has(lecture, 'notes')) { return; }

      NoteAPI.query({
        videoId: lecture.snippet.resourceId.videoId
      }, function(notes) {
        lecture.notes = notes;
      });
    };
    $scope.isSelected = function(lecture) {
      return $scope.selectedLecture === lecture;
    };

  });

});

