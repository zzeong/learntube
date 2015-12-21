'use strict';

angular.module('learntubeApp')
.controller('ClassroomCtrl', function ($scope, $state, $http, Auth, Note, GoogleConst, GApi, Upload, PlaylistItem, $mdToast, WatchedContent, $timeout) {
  $scope.videoId = $state.params.vid;
  $scope.playlistId = $state.params.pid;
  $scope.getCurrentUser = Auth.getCurrentUser;
  $scope.isLoggedIn = Auth.isLoggedIn;
  $scope.cid = null;
  $scope.haveLecture = false;
  $scope.httpBusy = true;
  $scope.href = $state.href.bind(null);
  $scope.getPageToken = PlaylistItem.getPageToken;
  $scope.fab = {
    DURATION: 200,
    isShowing: false,
    isOpen: false,
    isDisabled: false,
    ngClass: '',
    disable: function () {
      $timeout(function () {
        $scope.fab.isDisabled = true;
        $scope.fab.ngClass = 'invisible';
      }, this.DURATION);
    },
    enable: function () {
      $scope.fab.isDisabled = false;
      $timeout(function () {
        $scope.fab.ngClass = '';
      }, this.DURATION);
    },
    show: function (flag) {
      this.isShowing = flag;
    },
    toggleOpen: function ($event) {
      // md-fab-spped-dial directive change md-open variable automatically
      $event.stopPropagation();

      if (!$scope.note.isActivated()) {
        this.isOpen = !this.isOpen;
      }
    },
  };

  $scope.note = {
    upload: function (type, file) {
      console.log(type, file);
      return Note.upload(type, file)
      .then(function (res) {
        $scope.notes.push(res.data);
      })
      .catch(console.error);
    },
    editor: Note.editor,
    file: Note.file,
    isActivated: function () {
      return !!$scope.editor.activator || !!$scope.file.activator;
    },
  };

  $scope.showUpNote = function (note, activator) {
    if (!_.isNull(activator)) {
      $scope.fab.disable();
    }
    note.setActivator(activator);
  };

  Note.setIds({
    video: $scope.videoId,
    playlist: $scope.playlistId,
  });

  var compileToHTML = function (str) {
    var html = str.split('\n')
    .filter(function (p) { return p.length; })
    .map(function (p) { return '<p>' + p + '</p>'; })
    .join('');

    return html;
  };

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

  $scope.details = false;

  $scope.showDetails = function () {
    $scope.details = !$scope.details;
  };

  if ($scope.isLoggedIn()) {
    Note.query({ videoId: $scope.videoId })
    .$promise
    .then(function (notes) {
      $scope.notes = notes.map(function (note) {
        return note;
      });
    })
    .catch(console.error);
  }

  $http.get('/api/others-notes', {
    params: { videoId: $scope.videoId }
  })
  .then(function (res) {
    $scope.othersNotes = res.data.filter(function (note) {
      var isMine = false;
      $scope.notes.forEach(function (n) {
        if (n._id === note._id) { isMine = true;  }
      });
      return !isMine;
    });
  })
  .catch(console.error);

  $scope.completeLecture = () => {
    addCompletedLecture({ videoId: $scope.videoId })
    .then(() => {
      $scope.haveLecture = true;
      $scope.showToast('Lecture completed');
    })
    .catch(console.error);
  };

  $scope.editNote = function (note) {
    Note.getContents({ nid: note._id })
    .$promise
    .then(function (res) {
      note.contents = res.contents;
      note.isEditing = true;
    })
    .catch(console.error);
  };

  $scope.cancelEditing = function (note) {
    note.isEditing = false;
  };

  $scope.deleteNote = function (note) {
    Note.remove({ nid: note._id })
    .$promise
    .then(function () {
      _.remove($scope.notes, { _id: note._id });
    })
    .catch(console.error);
  };

  $scope.updateNote = function (file) {
    Upload.upload(file)
    .then(function (res) {
      $scope.notes = $scope.notes.map(function (note) {
        if (note._id === res.data._id) { return res.data; }
        return note;
      });
    })
    .catch(console.error);
  };


  $scope.shouldBeEmbedded = function (note) {
    if (note.resourceType.match(/^text\//)) {
      return true;
    }
    return false;
  };

  $scope.getDownloadUrl = function () {
    return '/api/classes/' + $scope.playlistId + '/lectures/' + $scope.videoId + '/get-handout';
  };

  $scope.getUserImgPath = function (user) {
    var guestImgPath = '/assets/images/guest.png';
    return _.has(user, 'google') ? user.google.image.url : guestImgPath;
  };

  $scope.showToast = (string) => {
    $mdToast.show(
      $mdToast.simple()
      .content(string)
      .position('bottom right')
      .hideDelay(3000)
    );
  };

  $scope.loadMore = function () {
    $scope.httpBusy = true;

    PlaylistItem.get({ playlistId: $scope.playlistId })
    .then(function (list) {
      $scope.lectureList = $scope.lectureList.concat(list);
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

      $scope.httpBusy = false;
    })
    .catch(console.error);
  };

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
    $scope.httpBusy = false;
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
});
