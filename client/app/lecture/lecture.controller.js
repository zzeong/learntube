'use strict';

angular.module('learntubeApp')
.controller('LectureCtrl', function ($scope, $stateParams, $http, Auth, NoteAPI, $log, GoogleConst, GApi, Upload) {
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

  GApi.execute('youtube', 'videos.list', {
    key: GoogleConst.browserKey,
    part: 'snippet,contentDetails,statistics',
    id: $scope.videoId
  })
  .then(function (res) {
    $scope.item = res.items[0];
    $scope.publishedDate = ($scope.item.snippet.publishedAt).substring(0,10);
  });

  $scope.details = false;

  $scope.showDetails = function () {
    console.log('here is showDetails');
    $scope.details = !$scope.details;
  };

  var textToFile = function (text) {
    return new Blob([text], {type: 'text/html'});
  };

  var keepNoteSoundly = function (note, src) {
    if (typeof src !== 'undefined') { _.assign(note, src); }

    if (!_.has(note, 'isEditing')) {
      note.isEditing = false;
    }
    return note;
  };

  if ($scope.isLoggedIn()) {
    NoteAPI.query({ videoId: $scope.videoId }, function (notes) {
      $scope.notes = notes.map(function (note) {
        return keepNoteSoundly(note);
      });
    });
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
    $scope.othersNotes = res.data;
  });

  $scope.completeLecture = function () {
    $http.post('/api/users/' + $scope.getCurrentUser()._id + '/classes/', {
      userId: $scope.getCurrentUser()._id
    }).success(function (response) {
      var classe = response;
      $http.post('/api/users/' + $scope.getCurrentUser()._id + '/classes/' + classe._id + '/lectures/', {
        videoId: $scope.videoId
      }).success(function () {
        $log.info('Saved Lecture');
      });
    });
  };

  $scope.toggleEditor = function () {
    $scope.isEditorOn = !$scope.isEditorOn;
  };
  $scope.toggleFileUpload = function () {
    $scope.isFileUploadOn = !$scope.isFileUploadOn;
  };

  $scope.editNote = function (note) {
    NoteAPI.getContents({ nid: note._id }, function (res) {
      note.contents = res.contents;
      note.isEditing = true;
    });
  };

  $scope.cancelEditing = function (note) {
    note.isEditing = false;
  };

  $scope.deleteNote = function (note) {
    NoteAPI.remove({ nid: note._id }, function () {
      _.remove($scope.notes, { _id: note._id });
    });
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
    });
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
    });
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
});

