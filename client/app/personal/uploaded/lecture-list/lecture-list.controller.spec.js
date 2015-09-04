'use strict';

describe('Controller: UploadedLectureListCtrl', function() {
  beforeEach(module('learntubeApp'));
  var $scope, createController;

  beforeEach(inject(function($controller) {
    $scope = {};
    createController = function() {
      return $controller('UploadedLectureListCtrl', { $scope: $scope }); 
    };
  }));


  describe('with HTTP', function() {
    var $httpBackend; 

    beforeEach(inject(function(_$httpBackend_, $stateParams) {
      $httpBackend = _$httpBackend_; 
      $stateParams.pid = 'PL12A65DE93A8357D6';

      var lecturelist = [{
        snippet: { resourceId: { videoId: 'QWER' } },
        status: {},
      }, {
        snippet: { resourceId: { videoId: 'ASDF' } },
        status: {},
      }, {
        snippet: { resourceId: { videoId: 'ZXCV' } },
        status: {},
      }];

      var classes = [{
        snippet: {}, 
        status: {},
      }];

      var files = [{
        lectures: [{
          videoId: 'QWER',
          s3Url: 'http://www.google.com',
        }, {
          videoId: 'ASDF',
          s3Url: 'http://www.yahoo.com',
        }]
      }];

      $httpBackend.when('GET', /\/api\/youtube\/classes\?.*/).respond(classes);
      $httpBackend.when('GET', /\/api\/youtube\/lecture-list\?.*/).respond(lecturelist);
      $httpBackend.when('GET', /\/api\/users\/.*\/uploaded\?.*/).respond(files);
    }));

    beforeEach(inject(function(Auth) {
      var userData = { 
        __v: 0,
        _id: 'QWER',
        email: 'test@test.com',
        name: 'Test User',
        provider: 'local',
        role: 'user'
      };

      $httpBackend.when('POST', '/auth/local').respond({ token: 'myToken' });
      $httpBackend.when('GET', '/api/users/me').respond(userData);

      Auth.login({ email: 'test@test.com', password: 'test' }); 
      $httpBackend.flush();
    }));

    afterEach(inject(function(Auth) {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
      Auth.logout(); 
    }));

    it('should get class summary when user entered the page', function() {
      createController(); 
      $httpBackend.expectGET(/\/api\/youtube\/classes\?.*/);
      $httpBackend.flush();

      expect($scope.summary.snippet).toBeDefined();
      expect($scope.summary.status).toBeDefined();
    });

    it('should get lecture list when user entered the page', function() {
      createController();   
      $httpBackend.expectGET(/\/api\/youtube\/lecture-list\?.*/);
      $httpBackend.flush();

      expect($scope.lectureList.length).toEqual(3);
      expect($scope.lectureList[0].snippet).toBeDefined();
      expect($scope.lectureList[0].status).toBeDefined();
    });

    it('should distinguish a lecture has a file or not', function() {
      createController(); 
      $httpBackend.expectGET(/\/api\/users\/.*\/uploaded\?.*/);
      $httpBackend.flush();
      expect($scope.haveUploadedFile($scope.lectureList[0])).toEqual(true);
      expect($scope.haveUploadedFile($scope.lectureList[1])).toEqual(true);
      expect($scope.haveUploadedFile($scope.lectureList[2])).toEqual(false);
    });
  });

});
