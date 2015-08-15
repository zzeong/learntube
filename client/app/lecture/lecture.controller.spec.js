'use strict';

describe('Controller: LectureCtrl', function () {
  beforeEach(module('learntubeApp')); 
  var $rootScope, createController;

  beforeEach(inject(function ($injector) {
    $rootScope = $injector.get('$rootScope');
    var $controller = $injector.get('$controller');

    createController = function() {
      return $controller('LectureCtrl', {'$scope' : $rootScope });
    };
  }));

  it('should get video id in URI-parameter', inject(function($stateParams) {
    createController();
    expect($rootScope.videoId).toBe($stateParams.vid);
  }));


  it('should be able to toggle note editor', inject(function() {
    createController();
    expect($rootScope.isNoteOn).toBe(false); 
    $rootScope.toggleNote();
    expect($rootScope.isNoteOn).toBe(true);
    $rootScope.toggleNote();
    expect($rootScope.isNoteOn).toBe(false);
  }));

  describe('with HTTP', function() {
    var $httpBackend, $cookieStore, resultItems;

    beforeEach(inject(function(_$httpBackend_, _$cookieStore_, Auth, $stateParams) {
      $httpBackend = _$httpBackend_;
      $cookieStore = _$cookieStore_;

      var userData = { 
        __v: 0,
        _id: 'QWER',
        email: 'test@test.com',
        name: 'Test User',
        provider: 'local',
        role: 'user'
      };

      resultItems = {
        items: [{
          snippet: {
            title: 'hello' 
          }
        }] 
      };

      $httpBackend.when('POST', '/auth/local').respond({ token: 'myToken' });
      $httpBackend.when('GET', '/api/users/me').respond(userData);

      Auth.login({ email: 'test@test.com', password: 'test' }); 
      $stateParams.vid = '2rde3';
      $httpBackend.flush();

      $httpBackend.when('GET', /https\:\/\/www\.googleapis\.com\/youtube\/v3\/videos\?.*/).respond(resultItems);
      $httpBackend.when('POST', /\/api\/users\/.*\/notes/).respond({ message: 'success' });
      $httpBackend.when('GET', /\/api\/users\/.*\/notes.*/).respond([{ _id: 'QWER', contents: '<h1>Hello</h1>' }]);
      $httpBackend.when('POST', /\/api\/users\/.*\/classes/).respond({ _id: 'QWER'  });
      $httpBackend.when('POST', /\/api\/users\/.*\/classes\/.*\/lectures/).respond({ _id: 'QWER' });
    })); 

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
      $cookieStore.remove('token'); 
    });


    it('should assign item which YouTube API responsed to scope item', inject(function() {
      createController();
      $httpBackend.expectGET(/https\:\/\/www\.googleapis\.com\/youtube\/v3\/videos\?.*/);
      $httpBackend.flush();

      expect($rootScope.item).toEqual(resultItems.items[0]); 
    }));

    it('should get notes which user have been saving', inject(function() {
      createController();
      $httpBackend.expectGET(/\/api\/users\/.*\/notes\?videoId=2rde3/);
      $httpBackend.flush(); 

      expect($rootScope.notes.length).toEqual(1);
      expect($rootScope.notes[0].contents).toEqual('<h1>Hello</h1>');
      expect($rootScope.notes[0]._id).toEqual('QWER');
    }));


    it('should send note and get refreshed notes', inject(function() {
      createController();
      $httpBackend.flush();

      $rootScope.notes = null;

      $rootScope.videoId = '2rde3';
      $rootScope.note = '<h1>Hi</h1>';
      $rootScope.doneNote();

      $httpBackend.expectPOST(/\/api\/users\/.*\/notes/);
      $httpBackend.expectGET(/\/api\/users\/.*\/notes\?videoId=2rde3/);
      $httpBackend.flush();
      expect($rootScope.notes).toBeDefined();
      expect($rootScope.notes.length).toEqual(1);
    }));

    it('should save current lecture with class', inject(function($log) {
      createController();
      $httpBackend.flush();

      $rootScope.completeLecture();

      $httpBackend.expectPOST(/\/api\/users\/.*\/classes/);
      $httpBackend.expectPOST(/\/api\/users\/.*\/classes\/.*\/lectures/);
      $httpBackend.flush();

      expect($log.info.logs).toContain(['Saved Lecture']);
    }));
  });
});
