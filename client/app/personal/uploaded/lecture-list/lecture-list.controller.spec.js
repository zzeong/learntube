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

    beforeEach(inject(function(_$httpBackend_) {
      $httpBackend = _$httpBackend_; 

      var lecturelist = [{
        snippet: {},
        status: {},
      }, {
        snippet: {},
        status: {},
      }];

      var classes = [{
        snippet: {}, 
        status: {},
      }];

      $httpBackend.when('GET', /\/api\/youtube\/classes\?.*/).respond(classes);
      $httpBackend.when('GET', /\/api\/youtube\/lecture-list\?.*/).respond(lecturelist);
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

      expect($scope.lectureList.length).toEqual(2);
      expect($scope.lectureList[0].snippet).toBeDefined();
      expect($scope.lectureList[0].status).toBeDefined();
    });
  });

});
