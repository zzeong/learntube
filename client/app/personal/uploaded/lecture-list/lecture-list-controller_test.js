'use strict';

xdescribe('Controller: UploadedLectureListCtrl', function () {
  beforeEach(module('learntubeApp'));
  beforeEach(module(($urlRouterProvider) => { $urlRouterProvider.deferIntercept(); }));

  var $scope, createController;

  beforeEach(inject(function ($controller) {
    $scope = {};
    createController = function () {
      return $controller('UploadedLectureListCtrl', { $scope: $scope });
    };
  }));


  describe('with HTTP', function () {
    var $httpBackend;

    beforeEach(inject(function (_$httpBackend_, $state) {
      $httpBackend = _$httpBackend_;
      $state.params.pid = 'PL12A65DE93A8357D6';

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
      $httpBackend.when('GET', /\/api\/users\/.*\/uploads\?.*/).respond(files);
    }));

    beforeEach(inject(function (Auth, $cookieStore) {
      var userData = {
        __v: 0,
        _id: 'QWER',
        email: 'test@test.com',
        name: 'Test User',
        role: 'user'
      };

      $cookieStore.put('token', 'myYummyCookie');
      $httpBackend.when('GET', '/api/users/me').respond(userData);

      Auth.reget();
      $httpBackend.flush();
    }));

    afterEach(inject(function (Auth) {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
      Auth.logout();
    }));

    it('should get class summary when user entered the page', function () {
      createController();
      $httpBackend.expectGET(/\/api\/youtube\/classes\?.*/);
      $httpBackend.flush();

      expect($scope.summary.snippet).toBeDefined();
      expect($scope.summary.status).toBeDefined();
    });

    it('should get lecture list when user entered the page', function () {
      createController();
      $httpBackend.expectGET(/\/api\/youtube\/lecture-list\?.*/);
      $httpBackend.flush();

      expect($scope.lectureList.length).toEqual(3);
      expect($scope.lectureList[0].snippet).toBeDefined();
      expect($scope.lectureList[0].status).toBeDefined();
    });

    it('should distinguish a lecture has a file or not', function () {
      createController();
      $httpBackend.expectGET(/\/api\/users\/.*\/uploads\?.*/);
      $httpBackend.flush();
      expect($scope.haveUploadedFile($scope.lectureList[0])).toEqual(true);
      expect($scope.haveUploadedFile($scope.lectureList[1])).toEqual(true);
      expect($scope.haveUploadedFile($scope.lectureList[2])).toEqual(false);
    });
  });

});
