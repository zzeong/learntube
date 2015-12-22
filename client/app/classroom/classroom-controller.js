(function (angular) {
  'use strict';

  angular.module('learntubeApp')
  .controller('ClassroomCtrl', ClassroomCtrl);

  function ClassroomCtrl($scope, $state, $http, Auth, Note, GoogleConst, GApi, Upload, PlaylistItem, $mdToast, WatchedContent, $timeout) {
    $scope.videoId = $state.params.vid;
    $scope.playlistId = $state.params.pid;
    $scope.cid = null;
    $scope.haveLecture = false;
    $scope.href = $state.href.bind(null);

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

        if (!$scope.note.isActivated()) {
          $scope.fab.isOpen = !$scope.fab.isOpen;
        }
      },
    };

    $scope.note = {
      upload: (type, file) => {
        return Note.upload(type, file)
        .then((res) => {
          $scope.fab.enable();
          $scope.myNotes.push(res.data);
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

    PlaylistItem.get({ playlistId: $scope.playlistId }, {
      initialToken: true,
    })
    .then(function (list) {
      $scope.lectureList = list;
    })
    .catch(console.error);

    if ($scope.isLoggedIn()) {
      Note.query({ videoId: $scope.videoId })
      .$promise
      .then(function (notes) {
        $scope.myNotes = notes;
      })
      .catch(console.error);
    }

    PlaylistItem.get({ playlistId: $scope.playlistId }, {
      initialToken: true,
    })
    .then(function (list) {
      $scope.lectureList = list;
      $scope.lectureList.map(function (obj) {

        GApi.execute('youtube', 'videos.list', {
          key: GoogleConst.browserKey,
          part: 'statistics',
          id: obj.snippet.resourceId.videoId
        })
        .then(function (res) {
          obj.viewCount = {
            viewCount: res.items[0].statistics.viewCount
          };
        })
        .catch(console.error);
      });
    })
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

    function editNote(note) {
      Note.getContents({ nid: note._id })
      .$promise
      .then(function (res) {
        note.contents = res.contents;
        note.isEditing = true;
      })
      .catch(console.error);
    }

    function cancelEditing(note) { note.isEditing = false; }

    function deleteNote(note) {
      Note.remove({ nid: note._id })
      .$promise
      .then(function () {
        _.remove($scope.myNotes, { _id: note._id });
      })
      .catch(console.error);
    }

    function updateNote(file) {
      Upload.upload(file)
      .then(function (res) {
        $scope.myNotes = $scope.myNotes.map(function (note) {
          if (note._id === res.data._id) { return res.data; }
          return note;
        });
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
