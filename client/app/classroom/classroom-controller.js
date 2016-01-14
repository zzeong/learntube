(function (angular) {
  'use strict';

  angular.module('learntubeApp')
  .controller('ClassroomCtrl', ClassroomCtrl);

  function ClassroomCtrl($scope, $state, $http, Auth, Note, GoogleConst, GApi, Upload, PlaylistItem, $mdToast, WatchedContent, $timeout) {
    $scope.videoId = $state.params.vid;
    $scope.playlistId = $state.params.pid;
    $scope.cid = null;
    $scope.haveLecture = false;
    $scope.href = $state.href;

    $scope.isEqual = _.isEqual;
    $scope.getCurrentUser = Auth.getCurrentUser;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.getPageToken = PlaylistItem.getPageToken;
    $scope.getDownloadUrl = getDownloadUrl;
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
            .catch(console.error);
          }

          $scope.myNotes.push(note);
        })
        .catch(console.error);
      },
      editor: Note.editor,
      file: Note.file,
      isActivated: () => {
        return !!$scope.editor.activator || !!$scope.file.activator;
      },
    };

    Note.setIds({
      videoId: $scope.videoId,
      playlistId: $scope.playlistId,
    });

    GApi.execute('youtube', 'videos.list', {
      key: GoogleConst.browserKey,
      part: 'snippet,contentDetails,statistics',
      id: $scope.videoId
    })
    .then(function (res) {
      $scope.item = res.items[0];
      $scope.publishedDate = ($scope.item.snippet.publishedAt).substring(0, 10);
      $scope.item.snippet.description = compileToHTML($scope.item.snippet.description);
    })
    .catch(console.error);

    if ($scope.isLoggedIn()) {
      WatchedContent.query({ playlistId: $scope.playlistId }).$promise
      .then((items) => {
        if (items.length) {
          markHaveLecture(items[0]);
        }

        function markHaveLecture(item) {
          $scope.cid = item._id;
          satisfy(item.lectures, (lecture) => _.isEqual(lecture.videoId, $scope.videoId), () => {
            $scope.haveLecture = true;
          });
        }
      })
      .catch(console.error);

      Note.query({ videoId: $scope.videoId }).$promise
      .then(function (notes) {
        $scope.myNotes = notes.map((note) => keepConstantNote(note));
        let editorNotes = notes.filter((note) => _.isEqual(note.type, 'editor'));
        editorNotes.forEach((note) => {
          Note.getContents({ nid: note._id }).$promise
          .then((res) => { note.contents = res.contents; })
          .catch(console.error);
        });
      })
      .catch(console.error);
    }

    PlaylistItem.get({ playlistId: $scope.playlistId }, {
      initialToken: true,
    })
    .then(function (list) { $scope.lectureList = list; })
    .catch(console.error);


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

    function getDownloadUrl() {
      return '/api/classes/' + $scope.playlistId + '/lectures/' + $scope.videoId + '/get-handout';
    }

    function showUpNote(note, activator) {
      if (!_.isNull(activator)) {
        $scope.fab.disable();
      }
      note.setActivator(activator);
    }

    function compileToHTML(str) {
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
      .catch(console.error);
    }

    function editNote(note) { note.isEditing = true; }
    function cancelEditing(note) { note.isEditing = false; }

    function deleteNote(note) {
      Note.remove({ nid: note._id })
      .$promise
      .then(() => {
        _.remove($scope.myNotes, { _id: note._id });
      })
      .catch(console.error);
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
      .catch(console.error);
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

  }

  ClassroomCtrl.$inject = [
    '$scope',
    '$state',
    '$http',
    'Auth',
    'Note',
    'GoogleConst',
    'GApi',
    'Upload',
    'PlaylistItem',
    '$mdToast',
    'WatchedContent',
    '$timeout'
  ];

})(angular);
