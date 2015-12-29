(function (angular) {
  'use strict';

  angular.module('learntubeApp')
  .controller('WatchedLectureListCtrl', WatchedLectureListCtrl);

  function WatchedLectureListCtrl($scope, Auth, $state, $http, WatchedContent, Note, GApi, GoogleConst, $q, PlaylistItem, $filter, NavToggler) {
    $scope.playlistId = $state.params.pid;
    $scope.href = $state.href;
    $scope.getPageToken = PlaylistItem.getPageToken;
    $scope.timeFormat = timeFormat;
    $scope.showNote = showNote;
    $scope.isSelected = isSelected;
    $scope.chart = {
      data: [],
      x: { id: 'x' },
      columns: [{
        id: 'lecture', type: 'line', name: 'completed lecture'
      }, {
        id: 'note', type: 'line', name: 'created note'
      }]
    };

    if (!Auth.isLoggedIn()) { $state.go('login'); }

    // 강의들을 가져오기 위한 api사용
    PlaylistItem.get({ playlistId: $scope.playlistId }, {
      initialToken: true,
    })
    .then((list) => {
      $scope.lectureList = list;
      $scope.httpBusy = false;

      // setting elements - highlight & noteIconVisible
      for (var i = 0; i < $scope.lectureList.length; i++) {
        $scope.lectureList[i].highlight = false;
        $scope.lectureList[i].noteIconVisible = false;
        $scope.lectureList[i].completedAt = '';
      }

      // DB에서 시청한 동영상 목록 가져오기 (seenLectures)
      WatchedContent.query({ playlistId: $scope.playlistId })
      .$promise
      .then((response) => {

        $scope.watchedLectures = response[0].lectures;
        separateLecture($scope.watchedLectures);
      })
      .catch(console.error);

      // DB에서 필기 목록 가져오기 (Note)
      Note.query({ playlistId: $scope.playlistId })
      .$promise
      .then((response) => {
        $scope.haveNoteLectures = response;
        separateLecture('noteIconVisible', $scope.haveNoteLectures);
        $scope.chart.data = transformToChart($scope.lectureList);
      })
      .catch(console.error);
    })
    .catch(console.error);


    function transformToChart(list) {
      let v11nData = getC3BaseData();
      let groupedObj = _.groupBy(list, (el) => y4m2d2Format(el.completedAt));

      return v11nData.map((datum) => {
        let target = groupedObj[y4m2d2Format(datum.x)] || [];
        datum.lecture = target.filter((el) => el.highlight || false).length;
        datum.note = target.filter((el) => el.noteIconVisible || false).length;
        return datum;
      });
    }

    function getC3BaseData() {
      const DURATION = 10;
      return _(_.times(DURATION)).reverse()
      .map((el) => ({
        x: moveDate(-el),
        lecture: 0,
        note: 0
      }))
      .value();
    }

    function y4m2d2Format(date) {
      date = _.isString(date) ? new Date(date) : date;
      return $filter('amDateFormat')(date, 'YYYY-MM-DD');
    }

    function moveDate(offset) {
      var d = new Date();
      d.setDate(d.getDate() + offset);
      return d;
    }

    function timeFormat(timestamp) {
      return d3.time.format('%Y-%m-%d')(new Date(timestamp));
    }

    function separateLecture(specificLecture) {
      for (var k in $scope.lectureList) {
        for (var s in specificLecture) {
          if ($scope.lectureList[k].snippet.resourceId.videoId === specificLecture[s].videoId) {
            $scope.lectureList[k].highlight = true;
            $scope.lectureList[k].completedAt = new Date(specificLecture[s].completedAt);
            $scope.lectureList[k].noteIconVisible = true;
          }
        }
      }
    }

    function showNote(lecture, ev) {
      ev.preventDefault();
      NavToggler.right();

      $scope.selectedLecture = lecture;
      if (_.has(lecture, 'notes')) { return; }

      Note.query({
        videoId: lecture.snippet.resourceId.videoId
      })
      .$promise
      .then((notes) => {
        lecture.notes = notes;
      })
      .catch(console.error);
    }

    function isSelected(lecture) {
      return $scope.selectedLecture === lecture;
    }
  }

  WatchedLectureListCtrl.$inject = ['$scope', 'Auth', '$state', '$http', 'WatchedContent', 'Note', 'GApi', 'GoogleConst', '$q', 'PlaylistItem', '$filter', 'NavToggler'];
})(angular);
