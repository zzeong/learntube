'use strict';

angular.module('learntubeApp')
.controller('WatchedLectureListCtrl', function ($scope, $stateParams, Auth, $state, $http, ClassAPI, $filter, NoteAPI, GApi, GoogleConst, $q) {
  $scope.playlistId = $stateParams.pid;

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
    })
    .catch(console.error);
  };

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
    })
    .then(function (response) {
      list.forEach(function (item, i) {
        item.contentDetails = response.items[i].contentDetails;
      });
      deferred.resolve(list);
    }, deferred.reject);

    return deferred.promise;
  };

  var separateLecture = function (identity, specificLecture) {

    for (var k = 0; k < $scope.lectureList.length; k++) {
      for (var s = 0; s < specificLecture.length; s++) {
        if ($scope.lectureList[k].snippet.resourceId.videoId === specificLecture[s].videoId) {
          if (identity === 'highlight') {
            $scope.lectureList[k].highlight = true;
          }else {
            $scope.lectureList[k].noteIconVisible = true;
          }
        }
      }
    }

  };

  var fitToD3 = function (data) {
    var timeMachine = function (offset) {
      var d = new Date();
      d.setDate(d.getDate() + offset);
      return d;
    };

    var filler = _.range(14).map(function (i) {
      return {
        date: timeMachine(-i),
        value: 0
      };
    });

    var source = _(data).countBy(function (lecture) {
      return lecture.completedAt;
    })
    .pairs()
    .map(function (pair) {
      return {
        date: new Date(pair[0]),
        value: pair[1]
      };
    })
    .value();

    return filler.map(function (d) {
      d = _.find(source, function (s) {
        return s.date.getDate() === d.date.getDate();
      }) || d;
      return d;
    });

  };

  if (!Auth.isLoggedIn()) { $state.go('Login'); }

  // 강의들을 가져오기 위한 api사용
  GApi.execute('youtube', 'playlistItems.list', {
    key: GoogleConst.browserKey,
    part: 'snippet,status,contentDetails',
    maxResults: 20,
    playlistId: $scope.playlistId,
    fields: 'items(contentDetails,snippet,status),nextPageToken',
  })
  .then(function (res) {
    $scope.pageToken = res.nextPageToken || null;
    return applyDuration(res.items);
  })
  .then(function (list) {
    $scope.lectureList = list;
    $scope.httpBusy = false;

    // setting elements - highlight & noteIconVisible
    for (var i = 0; i < $scope.lectureList.length; i++) {
      $scope.lectureList[i].highlight = false;
      $scope.lectureList[i].noteIconVisible = false;
    }

    // DB에서 시청한 동영상 목록 가져오기 (seenLectures)
    ClassAPI.query({ playlistId: $scope.playlistId })
    .$promise
    .then(function (response) {
      $scope.watchedLectures = response[0].lectures;
      $scope.vdata = fitToD3($scope.watchedLectures);
      separateLecture('highlight', $scope.watchedLectures);
    })
    .catch(console.error);

    // DB에서 필기 목록 가져오기 (Note)
    NoteAPI.query({ playlistId: $scope.playlistId })
    .$promise
    .then(function (response) {
      $scope.haveNoteLectures = response;
      separateLecture('noteIconVisible', $scope.haveNoteLectures);
    })
    .catch(console.error);

    $scope.showNote = function (lecture) {
      $scope.selectedLecture = lecture;
      if (_.has(lecture, 'notes')) { return; }

      NoteAPI.query({
        videoId: lecture.snippet.resourceId.videoId
      })
      .$promise
      .then(function (notes) {
        lecture.notes = notes;
      })
      .catch(console.error);
    };

    $scope.isSelected = function (lecture) {
      return $scope.selectedLecture === lecture;
    };


  });

});
