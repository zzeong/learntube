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

  it('should redirect non-login user to login page', inject(function($stateParams, $state) {
    $stateParams.pid = 'FOOBAR';
    spyOn($state, 'go'); 
    createController();

    expect($state.go).toHaveBeenCalled();
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

    it('should get lecture list when user entered', function() {
      createController();   
      $httpBackend.expectGET(/\/api\/youtube\/lecture-list\?.*/);
      $httpBackend.flush();

      expect($scope.lectureList.length).toEqual(2);
      expect($scope.lectureList[0].snippet).toBeDefined();
      expect($scope.lectureList[0].status).toBeDefined();
    });
  });

});
