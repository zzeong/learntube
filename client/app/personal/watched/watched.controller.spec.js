'use strict';

describe('Controller: WatchedContentsCtrl', function () {
  beforeEach(module('learntubeApp')); 
  var $scope, $httpBackend;

  beforeEach(inject(function ($controller, _$httpBackend_, Auth) {
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

    Auth.login({ email: 'test@test.com', password: 'test' }); 
    $httpBackend.flush();

    $controller('WatchedContentsCtrl', {'$scope' : $scope });
  }));


  afterEach(inject(function(Auth) {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
    Auth.logout(); 
  }));

  describe('with HTTP', function() {

    beforeEach(function() {
      var res = {
        classQuery: [{
          _id: 'QWER',
          userId: '123',
          playlistId: 'Q1W2'
        }, {
          _id: 'QWER',
          userId: '123',
          playlistId: 'E3R4'
        }],
        youtube: { items: [{}, {}] },
      };

      $httpBackend.when('GET', /\/api\/users\/.*\/classes/).respond(res.classQuery);
      $httpBackend.when('DELETE', /\/api\/users\/.*\/classes\/.*/).respond();
    });



    xit('should get all classes', function() {
      $httpBackend.expectGET(/\/api\/users\/.*\/classes/);
      $httpBackend.expectGET(/https\:\/\/www\.googleapis\.com\/youtube\/v3\/playlists\?.*/);
      $httpBackend.flush();

      expect($scope.classes[0]._id).toEqual('QWER');
      expect($scope.classes[0].item).toBeDefined();
    });

    it('should have 1 decreased classes after to delete class', function() {
      $httpBackend.flush();

      var beforeLength = $scope.classes.length;
      $scope.deleteClass($scope.classes[0]);

      $httpBackend.expectDELETE(/\/api\/users\/.*\/classes\/.*/);
      $httpBackend.flush();

      expect($scope.classes.length).toEqual(beforeLength - 1);
    });

  });
});
