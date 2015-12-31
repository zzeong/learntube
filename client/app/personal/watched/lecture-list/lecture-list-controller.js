(function (angular) {
  'use strict';

  angular.module('learntubeApp')
  .controller('WatchedLectureListCtrl', WatchedLectureListCtrl);

  function WatchedLectureListCtrl($scope, Auth, $state, $http, WatchedContent, Note, GApi, GoogleConst, $q, PlaylistItem, $filter, NavToggler) {
    $scope.playlistId = $state.params.pid;
    $scope.href = $state.href;
    $scope.getPageToken = PlaylistItem.getPageToken;
    $scope.tickFormat = tickFormat;
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

    PlaylistItem.get({ playlistId: $scope.playlistId }, {
      initialToken: true,
    })
    .then((res) => {
      let query = { playlistId: $scope.playlistId };
      $scope.lectures = res;

      WatchedContent.query(query).$promise
      .then((res) => {
        let grouped = _.groupBy(res[0].lectures, 'videoId');
        $scope.lectures = $scope.lectures.map((lecture) => {
          let id = lecture.snippet.resourceId.videoId;
          lecture.watched = _.has(grouped, id) ? grouped[id][0] : null;
          return lecture;
        });
      })
      .catch(console.error);

      Note.query(query).$promise
      .then((res) => {
        let grouped = _.groupBy(res, 'videoId');
        $scope.lectures = $scope.lectures.map((lecture) => {
          let id = lecture.snippet.resourceId.videoId;
          lecture.note = _.has(grouped, id) ? grouped[id][0] : null;
          return lecture;
        });
        $scope.chart.data = transformToChart($scope.lectures);
      })
      .catch(console.error);
    })
    .catch(console.error);


    function transformToChart(list) {
      let v11nData = getC3BaseData();
      let groupedByWatched = _.groupBy(list, (el) => {
        let date = _.has(el.watched, 'completedAt') ? el.watched.completedAt : null;
        return y4m2d2Format(date);
      });
      let groupedByNote = _.groupBy(list, (el) => {
        let date = _.has(el.note, 'created') ? el.note.created : null;
        return y4m2d2Format(date);
      });

      return v11nData.map((datum) => {
        let watchedArrInDay = groupedByWatched[y4m2d2Format(datum.x)] || [];
        let noteArrInDay = groupedByNote[y4m2d2Format(datum.x)] || [];
        datum.lecture = watchedArrInDay.length;
        datum.note = noteArrInDay.length;
        return datum;
      });
    }

    function getC3BaseData() {
      const TERM = 10;
      return _(_.times(TERM)).reverse()
      .map((el) => ({
        x: offsetDate(-el),
        lecture: 0,
        note: 0
      }))
      .value();
    }

    function y4m2d2Format(date) {
      if (_.isNull(date)) { return ''; }
      date = _.isString(date) ? new Date(date) : date;
      return $filter('amDateFormat')(date, 'YYYY-MM-DD');
    }

    function offsetDate(offset) {
      var d = new Date();
      d.setDate(d.getDate() + offset);
      return d;
    }

    function tickFormat(timestamp) {
      return d3.time.format('%Y-%m-%d')(new Date(timestamp));
    }

    function showNote(lecture, ev) {
      $scope.selectedLecture = lecture;

      if (lecture.note.type === 'editor') {
        Note.getContents({ nid: lecture.note._id }).$promise
        .then((res) => {
          lecture.note.contents = res.contents;
          NavToggler.right();
        })
        .catch(console.error);
      } else {
        NavToggler.right();
      }

      ev.preventDefault();
    }

    function isSelected(lecture) {
      return $scope.selectedLecture === lecture;
    }
  }

  WatchedLectureListCtrl.$inject = ['$scope', 'Auth', '$state', '$http', 'WatchedContent', 'Note', 'GApi', 'GoogleConst', '$q', 'PlaylistItem', '$filter', 'NavToggler'];
})(angular);
