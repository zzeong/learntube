'use strict';

angular.module('learntubeApp')
.controller('LectureCtrl', function($scope, $stateParams, $http, Auth, NoteAPI, $log, GoogleConst) {
  $scope.videoId = $stateParams.vid;
  $scope.playlistId = $stateParams.pid;
  $scope.playerVars = {
    listType: 'playlist',
    list: $scope.playlistId
  };
  $scope.isNoteOn = false;
  $scope.getCurrentUser = Auth.getCurrentUser;
  $scope.isLoggedIn = Auth.isLoggedIn;

  $http.get('https://www.googleapis.com/youtube/v3/videos', {
    params: {
      key: GoogleConst.browserKey,
      part: 'snippet,contentDetails',
      id: $scope.videoId
    }
  }).success(function(response) {
    $scope.item = response.items[0];
  });

  var keepNoteSoundly = function(note, src) {
    if(typeof src !== 'undefined') { _.assign(note, src); }

    if(!_.has(note, 'isEditing')) {
      note.isEditing = false;
    }
    return note;
  };

  if($scope.isLoggedIn()) {
    NoteAPI.query({ videoId: $scope.videoId }, function(notes) {
      $scope.notes = notes.map(function(note) {
        return keepNoteSoundly(note);
      });
    });
  }

  $http.get('/api/others-notes', {
    params: { videoId: $scope.videoId }
  })
  .then(function(res) {
    $scope.othersNotes = res.data;
  });

  $scope.completeLecture = function() {
    $http.post('/api/users/' + $scope.getCurrentUser()._id + '/classes/', {
      userId: $scope.getCurrentUser()._id
    }).success(function(response) {
      var classe = response;
      $http.post('/api/users/' + $scope.getCurrentUser()._id + '/classes/' + classe._id + '/lectures/', {
        videoId: $scope.videoId
      }).success(function() {
        $log.info('Saved Lecture');  
      });
    });
  };

  $scope.toggleNote = function() {
    $scope.isNoteOn = !$scope.isNoteOn; 
  };

  $scope.editNote = function(note) {
    note.isEditing = true;
  };
  $scope.cancelEditing = function(note) {
    note.isEditing = false; 
  };

  $scope.deleteNote = function(note) {
    NoteAPI.remove({ nid: note._id }, function(res) {
      _.remove($scope.notes, { _id: res._id });
    });
  };

  $scope.updateNote = function(note) {
    NoteAPI.update({ nid: note._id }, { contents: note.contents }, function(res) {
      $scope.notes = $scope.notes.map(function(elNote) {
        if(elNote._id === res._id) {
          return keepNoteSoundly(res, { contents: note.contents });
        }
        return elNote;
      });
    }); 
  };

  $scope.doneNote = function() {
    var params = {
      videoId: $scope.videoId,
      playlistId: $scope.playlistId,
      contents: $scope.noteContents
    };

    NoteAPI.create(params, function(res) {
      var note = keepNoteSoundly(res, {
        contents: $scope.noteContents,
      });

      $scope.notes.push(note);

      $scope.noteContents = '';
      $scope.toggleNote();
    });
  };


  $scope.getUserImgPath = function(user) {
    var guestImgPath = '/assets/images/guest.png';
    return _.has(user, 'google') ? user.google.image.url : guestImgPath;   
  };
});

