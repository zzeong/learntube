'use strict';

angular.module('learntubeApp')
.controller('WatchedLectureListCtrl', function($scope, $stateParams, Auth, $state, $http, $log, ClassAPI, $filter, NoteAPI, GApi, GoogleConst, $q) {
  $scope.playlistId = $stateParams.pid;

  $scope.loadMore = function(token) {
    $scope.httpBusy = true;

    GApi.execute('youtube', 'playlistItems.list', {
      key: GoogleConst.browserKey,
      part: 'snippet',
      maxResults: 20,
      playlistId: $scope.playlistId,
      fields: 'items(contentDetails,snippet,status),nextPageToken',
      pageToken: token
    })
    .then(function(res) {
      $scope.pageToken = res.nextPageToken || null;
      return applyDuration(res.items);
    })
    .then(function(list) {
      $scope.lectureList = $scope.lectureList.concat(list);
      $scope.httpBusy = false;
    });
  };

  var applyDuration = function(list) {
    var deferred = $q.defer();
    var ids = list.map(function(item) {
      return item.snippet.resourceId.videoId; 
    }).join(',');

    GApi.execute('youtube', 'videos.list', {
      key: GoogleConst.browserKey,
      part: 'contentDetails',
      id: ids,
      fields: 'items(contentDetails(duration))',
    }).then(function(response) {
      list.forEach(function(item, i) {
        item.contentDetails = response.items[i].contentDetails; 
      }); 
      deferred.resolve(list);
    }, deferred.reject);

    return deferred.promise;
  };

  var separateLecture = function(identity, specificLecture){

    for(var k=0; k<$scope.lectureList.length; k++){
      for(var s=0; s<specificLecture.length; s++){
        if($scope.lectureList[k].snippet.resourceId.videoId === specificLecture[s].videoId){
          if(identity === 'highlight'){
            $scope.lectureList[k].highlight = true;
          }else{
            $scope.lectureList[k].noteIconVisible = true;
          }
        }
      }
    }

  };

  if(!Auth.isLoggedIn()) { $state.go('Login'); }

  // 강의들을 가져오기 위한 api사용
  GApi.execute('youtube', 'playlistItems.list', {
    key: GoogleConst.browserKey, 
    part: 'snippet,status,contentDetails',
    maxResults: 20,
    playlistId: $scope.playlistId,
    fields: 'items(contentDetails,snippet,status),nextPageToken',
  })
  .then(function(res) {
    $scope.pageToken = res.nextPageToken || null;
    return applyDuration(res.items);
  })
  .then(function(list){
    $scope.lectureList = list;
    $scope.httpBusy = false;

    // setting elements - highlight & noteIconVisible
    for(var i=0; i<$scope.lectureList.length; i++){
      $scope.lectureList[i].highlight = false;
      $scope.lectureList[i].noteIconVisible = false;
    }

    // DB에서 시청한 동영상 목록 가져오기 (seenLectures)
    ClassAPI.query({playlistId: $scope.playlistId}, function(response){
      $scope.watchedLectures = response[0].lectures;
      separateLecture('highlight', $scope.watchedLectures);
    }, function(err){
      $log.error(err);
    });


    // DB에서 필기 목록 가져오기 (Note)
    NoteAPI.query({playlistId: $scope.playlistId}, function(response){
      $scope.haveNoteLectures = response;
      separateLecture('noteIconVisible', $scope.haveNoteLectures);
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

