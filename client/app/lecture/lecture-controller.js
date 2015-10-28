'use strict';

angular.module('learntubeApp')
.controller('LectureCtrl', function ($scope, $stateParams, $http, Auth, Note, GoogleConst, GApi, Upload, PlaylistItem, $mdToast, Class, Lecture) {
  $scope.videoId = $stateParams.vid;
  $scope.playlistId = $stateParams.pid;
  $scope.playerVars = {
    listType: 'playlist',
    list: $scope.playlistId
  };
  $scope.isEditorOn = false;
  $scope.isFileUploadOn = false;
  $scope.getCurrentUser = Auth.getCurrentUser;
  $scope.isLoggedIn = Auth.isLoggedIn;
  $scope.cid = null;
  $scope.haveLecture = false;

  Class.query({ playlistId: $scope.playlistId }).$promise
  .then(function (items) {
    if (items.length) {
      var item = items[0];

      $scope.cid = item._id;
      for (var i = 0; i < item.lectures.length; i++) {
        if (item.lectures[i].videoId === $scope.videoId) {
          $scope.haveLecture = true;
          break;
        }
      }
    }
  })
  .catch(console.error);

  var compileToHTML = function (str) {
    var html = str.split('\n')
    .filter(function (p) { return p.length; })
    .map(function (p) { return '<p>' + p + '</p>'; })
    .join('');

    return html;
  };

  GApi.execute('youtube', 'videos.list', {
    key: GoogleConst.browserKey,
    part: 'snippet,contentDetails,statistics',
    id: $scope.videoId
  })
  .then(function (res) {
    $scope.item = res.items[0];
    $scope.publishedDate = ($scope.item.snippet.publishedAt).substring(0,10);
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

  var textToFile = function (text) {
    return new Blob([text], { type: 'text/html' });
  };

  var keepNoteSoundly = function (note, src) {
    if (typeof src !== 'undefined') { _.assign(note, src); }

    if (!_.has(note, 'isEditing')) {
      note.isEditing = false;
    }
    return note;
  };

  if ($scope.isLoggedIn()) {
    Note.query({ videoId: $scope.videoId })
    .$promise
    .then(function (notes) {
      $scope.notes = notes.map(function (note) {
        return keepNoteSoundly(note);
      });
    })
    .catch(console.error);
  }

  var initializeNotePanel = function (type) {
    if (type === 'file') {
      $scope.noteFile = undefined;
      if ($scope.isFileUploadOn) {
        $scope.toggleFileUpload();
      }
    } else if (type === 'editor') {
      $scope.noteContents = '';
      if ($scope.isEditorOn) {
        $scope.toggleEditor();
      }
    } else {
      return;
    }
  };

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

  var completeLectureHelper = function () {
    var params = { videoId: $scope.videoId };

    if ($scope.cid === null) {
      return Class.create({
        playlistId: $scope.playlistId
      }).$promise
      .then(function (item) {
        params.cid = item._id;
        return Lecture.create(params).$promise;
      });
    } else {
      params.cid = $scope.cid;
      return Lecture.create(params).$promise;
    }
  };

  $scope.completeLecture = function () {
    completeLectureHelper()
    .then(function () {
      $scope.haveLecture = true;
      $scope.showSimpleToast();
    })
    .catch(console.error);
  };

  $scope.toggleEditor = function () {
    $scope.isEditorOn = !$scope.isEditorOn;
  };
  $scope.toggleFileUpload = function () {
    $scope.isFileUploadOn = !$scope.isFileUploadOn;
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

  $scope.updateNote = function (note) {
    var file = textToFile(note.contents);

    Upload.upload({
      url: '/api/users/' + Auth.getCurrentUser()._id + '/notes/' + note._id,
      method: 'PUT',
      file: file
    })
    .then(function (res) {
      $scope.notes = $scope.notes.map(function (note) {
        if (note._id === res.data._id) { return keepNoteSoundly(res.data); }
        return note;
      });
    })
    .catch(console.error);
  };

  $scope.doneNote = function (type, file) {
    if (type === 'editor') {
      file = textToFile(file);
    }

    Upload.upload({
      url: '/api/users/' + Auth.getCurrentUser()._id + '/notes',
      method: 'POST',
      fields: {
        videoId: $scope.videoId,
        playlistId: $scope.playlistId,
        type: type
      },
      file: file
    })
    .then(function (res) {
      var note = keepNoteSoundly(res.data);
      $scope.notes.push(note);

      initializeNotePanel(type);
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

  $scope.showSimpleToast = function () {

    var positionArr = 'top right';

    $mdToast.show(
      $mdToast.simple()
        .content('Lecture Complete!')
        .position(positionArr)
        .hideDelay(3000)
    );
  };

});
