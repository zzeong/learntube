(function (angular) {
  'use strict';

  angular.module('learntubeApp')
  .controller('ClassroomCtrl', ClassroomCtrl);

  function ClassroomCtrl($scope, $state, $http, Auth, Note, Upload, $mdToast, WatchedContent, $timeout, LoadMore) {
    $scope.videoId = $state.params.vid;
    $scope.playlistId = $state.params.pid;
    $scope.cid = null;
    $scope.haveLecture = false;
    $scope.href = $state.href;

    $scope.isEqual = _.isEqual;
    $scope.getCurrentUser = Auth.getCurrentUser;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.downloadHandout = downloadHandout;
    $scope.showToast = showToast;
    $scope.showUpNote = showUpNote;
    $scope.completeLecture = completeLecture;
    $scope.editNote = editNote;
    $scope.cancelEditing = cancelEditing;
    $scope.deleteNote = deleteNote;
    $scope.updateNote = updateNote;
    $scope.shouldBeEmbedded = shouldBeEmbedded;
    $scope.getUserImgPath = getUserImgPath;
    $scope.myNotes = null;
    $scope.goBackward = goBackward;
    $scope.fetchLectures = fetchLectures;
    $scope.lectures = [];

    $scope.fab = {
      DURATION: 200,
      isShowing: false,
      isOpen: false,
      isDisabled: false,
      ngClass: '',
      disable: () => {
        $timeout(() => {
          $scope.fab.isDisabled = true;
          $scope.fab.ngClass = 'invisible';
        }, $scope.fab.DURATION);
      },
      enable: () => {
        $scope.fab.isDisabled = false;
        $timeout(() => {
          $scope.fab.ngClass = '';
        }, $scope.fab.DURATION);
      },
      show: (flag) => {
        $scope.fab.isShowing = flag;
      },
      toggleOpen: ($event) => {
        // md-fab-spped-dial directive change md-open variable automatically
        $event.stopPropagation();

        if (!$scope.noteObj.isActivated()) {
          $scope.fab.isOpen = !$scope.fab.isOpen;
        }
      },
    };

    $scope.noteObj = {
      upload: (file, type) => {
        return Note.upload(file, { type })
        .then((res) => {
          let note = res.data;
          $scope.fab.enable();

          if (_.isEqual(note.type, 'editor')) {
            Note.getContents({ nid: note._id }).$promise
            .then((res) => {
              note.contents = res.contents;
            })
            .catch((e) => console.error(e));
          }

          $scope.myNotes.push(note);
        })
        .catch((e) => console.error(e));
      },
      editor: Note.editor,
      file: Note.file,
      isActivated: () => {
        return !!$scope.editor.activator || !!$scope.file.activator;
      },
    };

    $scope.reqLectures = LoadMore.createRequest('/api/lectures', (data) => {
      let p = _.pick($scope, 'playlistId');
      return _.has(data, 'nextPageToken') ? _.set(p, 'pageToken', data.nextPageToken) : p;
    });

    Note.setIds({
      videoId: $scope.videoId,
      playlistId: $scope.playlistId,
    });

    $scope.fetchLectures($scope.reqLectures);

    $http.get('/api/lectures', {
      params: _.pick($scope, ['playlistId', 'videoId'])
    })
    .then((res) => {
      let video = _.head(res.data.items);
      video.description = compileToHTML(video.description);
      $scope.video = video;
    })
    .catch((e) => console.error(e));

    if ($scope.isLoggedIn()) {
      WatchedContent.get(_.pick($scope, 'playlistId')).$promise
      .then((res) => {
        if (res.items.length) {
          markHaveLecture(_.first(res.items));
        }

        function markHaveLecture(item) {
          $scope.cid = item._id;
          satisfy(item.lectures, (lecture) => _.isEqual(lecture.videoId, $scope.videoId), () => {
            $scope.haveLecture = true;
          });
        }
      })
      .catch((e) => console.error(e));

      Note.query({ videoId: $scope.videoId }).$promise
      .then((notes) => {
        $scope.myNotes = notes.map((note) => keepConstantNote(note));

        let editorNotes = notes.filter(_.matches({ type: 'editor' }))
        .sort((a, b) => Date.parse(a.created) < Date.parse(b.created));

        return editorNotes.reduce((promise, note) => {
          return promise.then(() => {
            return Note.getContents({ nid: note._id }).$promise
            .then((res) => note.contents = res.contents);
          });
        }, Promise.resolve());
      })
      .catch((err) => console.error(err.data));
    }

    function addCompletedLecture(params) {
      if (_.isNull($scope.cid)) {
        return WatchedContent.create({ playlistId: $scope.playlistId }).$promise
        .then((item) => {
          params.cid = item._id;
          return WatchedContent.lecture.create(params).$promise;
        });
      } else {
        params.cid = $scope.cid;
        return WatchedContent.lecture.create(params).$promise;
      }
    }

    function satisfy(arr, fn, onSatisfy) {
      var filtered = Array.prototype.filter.call(arr, fn);
      if (filtered.length) { onSatisfy(); }
    }

    function showToast(string) {
      $mdToast.show(
        $mdToast.simple()
        .content(string)
        .position('bottom right')
        .hideDelay(3000)
      );
    }

    function downloadHandout() {
      let paramsUrl = _($scope)
      .pick(['playlistId', 'videoId'])
      .map((val, key) => `${key}=${val}`)
      .value()
      .join('&');

      return `/api/lectures/get-handout?${paramsUrl}`;
    }

    function showUpNote(note, activator) {
      if (!_.isNull(activator)) {
        $scope.fab.disable();
      }
      note.setActivator(activator);
    }

    function compileToHTML(str = '') {
      var html = str.split('\n')
      .filter(function (p) { return p.length; })
      .map(function (p) { return '<p>' + p + '</p>'; })
      .join('');

      return html;
    }

    function completeLecture() {
      addCompletedLecture({ videoId: $scope.videoId })
      .then(() => {
        $scope.haveLecture = true;
        $scope.showToast('Lecture completed');
      })
      .catch((e) => console.error(e));
    }

    function editNote(note) { note.isEditing = true; }
    function cancelEditing(note) { note.isEditing = false; }

    function deleteNote(note) {
      Note.remove({ nid: note._id })
      .$promise
      .then(() => {
        _.remove($scope.myNotes, { _id: note._id });
      })
      .catch((e) => console.error(e));
    }

    function updateNote(note) {
      let file = new Blob([note.contents], { type: 'text/html' });
      Note.update(file, { type: note.type }, note._id)
      .then((res) => {
        note = _.assign(note, res.data);
        return Note.getContents({ nid: note._id }).$promise;
      })
      .then((res) => {
        note.contents = res.contents;
        note.isEditing = false;
      })
      .catch((e) => console.error(e));
    }

    function shouldBeEmbedded(note) {
      if (note.resourceType.match(/^text\//)) {
        return true;
      }
      return false;
    }

    function getUserImgPath(user) {
      var guestImgPath = '/assets/images/guest.png';
      return _.has(user, 'google') ? user.google.image.url : guestImgPath;
    }

    function keepConstantNote(note) {
      note.isEditing = false;
      return note;
    }

    function goBackward() {
      window.history.back();
    }

    function fetchLectures(req) {
      return req()
      .then((res) => {
        $scope.lectures = $scope.lectures.concat(res.data.items);
        $scope.existNextLectures = _.has(res.data, 'nextPageToken');
      })
      .catch((err) => console.error(err));
    }
  }

  ClassroomCtrl.$inject = [
    '$scope',
    '$state',
    '$http',
    'Auth',
    'Note',
    'Upload',
    '$mdToast',
    'WatchedContent',
    '$timeout',
    'LoadMore'
  ];

})(angular);
