'use strict';

describe('Controller: LectureCtrl', function () {
  beforeEach(module('learntubeApp')); 
  var $scope, $httpBackend;

  beforeEach(inject(function ($controller, $stateParams, _$httpBackend_, Auth) {
    var userData = { 
      __v: 0,
      _id: 'QWER',
      email: 'test@test.com',
      name: 'Test User',
      provider: 'local',
      role: 'user'
    };

    $httpBackend = _$httpBackend_;
    $scope = {};
    
    $httpBackend.when('POST', '/auth/local').respond({ token: 'myToken' });
    $httpBackend.when('GET', '/api/users/me').respond(userData);

    $stateParams.vid = '2rde3';
    Auth.login({ email: 'test@test.com', password: 'test' }); 
    $httpBackend.flush();

    $controller('LectureCtrl', { $scope: $scope });
  }));

  it('should get video id in URI-parameter', inject(function($stateParams) {
    expect($scope.videoId).toBe($stateParams.vid);
  }));


  it('should be able to toggle note editor', inject(function() {
    expect($scope.isEditorOn).toBe(false); 
    $scope.toggleEditor();
    expect($scope.isEditorOn).toBe(true);
    $scope.toggleEditor();
    expect($scope.isEditorOn).toBe(false);
  }));

  describe('with HTTP', function() {
    var $cookieStore, resultItems;

    beforeEach(inject(function(_$cookieStore_) {
      $cookieStore = _$cookieStore_;

      resultItems = {
        items: [{
          snippet: {
            title: 'hello' 
          }
        }] 
      };


      var othersNotes = [{
        userId: {
          image: {
            url: 'http://www.google.com' 
          }, 
        },
        contents: 'Hi, Guys'
      }, {
        userId: {
          image: {
            url: 'http://www.google.co.kr' 
          }, 
        },
        contents: 'Hi, Guys'
      }];


      $httpBackend.when('GET', /https\:\/\/www\.googleapis\.com\/youtube\/v3\/videos\?.*/).respond(resultItems);
      $httpBackend.when('POST', /\/api\/users\/.*\/notes/).respond({ _id: 'NQWER' });
      $httpBackend.when('GET', /\/api\/users\/.*\/notes\?.*/).respond([{ _id: 'NQWER' }]);
      $httpBackend.when('PUT', /\/api\/users\/.*\/notes\/.*/).respond({ _id: 'NQWER', });
      $httpBackend.when('GET', /\/api\/users\/.*\/notes\/.*\/get-contents.*/).respond({ _id: 'NQWER', contents: '<h1>IHAVENOMONEY</h1>' });
      $httpBackend.when('DELETE', /\/api\/users\/.*\/notes\/.*/).respond({ _id: 'NQWER' });
      $httpBackend.when('POST', /\/api\/users\/.*\/classes/).respond({ _id: 'QAWS'  });
      $httpBackend.when('POST', /\/api\/users\/.*\/classes\/.*\/lectures/).respond({ _id: 'ZXCV' });
      $httpBackend.when('GET', /\/api\/others-notes\?.*/).respond(othersNotes);
    })); 

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
      $cookieStore.remove('token'); 
    });


    xit('should assign item which YouTube API responsed to scope item', inject(function() {
      $httpBackend.expectGET(/https\:\/\/www\.googleapis\.com\/youtube\/v3\/videos\?.*/);
      $httpBackend.flush();

      expect($scope.item).toEqual(resultItems.items[0]); 
    }));

    it('should provide editing status to notes', inject(function() {
      $httpBackend.expectGET(/\/api\/users\/.*\/notes\?videoId=2rde3/);
      $httpBackend.flush();

      expect($scope.notes[0].isEditing).toBeFalsy();
    }));

    it('should get notes which user have been saving', inject(function() {
      $httpBackend.expectGET(/\/api\/users\/.*\/notes\?videoId=2rde3/);
      $httpBackend.flush(); 

      expect($scope.notes.length).toEqual(1);
      expect($scope.notes[0]._id).toEqual('NQWER');
    }));


    it('should save editor contents and push saved notes', inject(function() {
      $httpBackend.flush();
      var beforeLength = $scope.notes.length;

      $scope.videoId = '2rde3';
      $scope.playlistId = 'SHEWILLLOVEME';
      $scope.noteContents = '<h1>Hi</h1>';

      spyOn($scope, 'toggleEditor');
      $scope.toggleEditor();
      $scope.doneNote('editor', $scope.noteContents);

      $httpBackend.expectPOST(/\/api\/users\/.*\/notes/);
      $httpBackend.flush();

      expect($scope.notes.length).toEqual(beforeLength + 1);
      expect($scope.noteContents).toEqual('');
      expect($scope.toggleEditor).toHaveBeenCalled();
    }));

    it('should change the editor window to a note viewer when note is updated', function() {
      $httpBackend.flush();

      var note = {
        _id: 'NQWER',
        contents: '<h1>Updated</h1>',
        isEditing: true
      }; 
      $scope.updateNote(note);

      $httpBackend.expectPUT(/\/api\/users\/.*\/notes\/NQWER/);
      $httpBackend.flush();
      expect($scope.notes[0].isEditing).toEqual(false);
    });


    it('should delete listed note and have notes', function() {
      $httpBackend.flush();

      var beforeLength = $scope.notes.length;
      $scope.deleteNote({ _id: 'NQWER' });

      $httpBackend.expectDELETE(/\/api\/users\/.*\/notes\/NQWER/);
      $httpBackend.flush();

      expect($scope.notes.length).toEqual(beforeLength - 1);
    });


    it('should save current lecture with class', inject(function($log) {
      $httpBackend.flush();

      $scope.completeLecture();

      $httpBackend.expectPOST(/\/api\/users\/.*\/classes/);
      $httpBackend.expectPOST(/\/api\/users\/.*\/classes\/.*\/lectures/);
      $httpBackend.flush();

      expect($log.info.logs).toContain(['Saved Lecture']);
    }));

    it('should get notes which are written by others', function() {
      $httpBackend.expectGET(/\/api\/others-notes\?.*/);
      $httpBackend.flush();

      expect($scope.othersNotes).toEqual(jasmine.any(Array));
      expect($scope.othersNotes.length).toEqual(2);
    });

    it('should show note as embedded', function() {
      $httpBackend.flush();

      var notes = [{
        resourceType: 'text/html' 
      }, {
        resourceType: 'text/plain' 
      }, {
        resourceType: 'image/jpeg' 
      }];

      expect($scope.shouldBeEmbedded(notes[0])).toEqual(true);
      expect($scope.shouldBeEmbedded(notes[1])).toEqual(true);
      expect($scope.shouldBeEmbedded(notes[2])).toEqual(false);
    });

    it('should show editing area that have got note contents when a user edit the note', function() {
      $httpBackend.flush(); 

      var note = { _id: 'NQWER' };
      $scope.editNote(note);
      $httpBackend.flush(); 

      expect(note.contents).toBeDefined();
      expect(note.isEditing).toEqual(true);
    });

  });
});
