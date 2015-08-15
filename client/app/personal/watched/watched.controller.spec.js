'use strict';

describe('Controller: WatchedContentsCtrl', function () {
  beforeEach(module('learntubeApp')); 
  var $rootScope, createController;

  beforeEach(inject(function ($injector) {
    $rootScope = $injector.get('$rootScope');
    var $controller = $injector.get('$controller');

    createController = function() {
      return $controller('WatchedContentsCtrl', {'$scope' : $rootScope });
    };
  }));

  describe('with HTTP', function() {
    var $httpBackend, res;

    beforeEach(inject(function(_$httpBackend_, Auth) {
      $httpBackend = _$httpBackend_; 

      var userData = { 
        __v: 0,
        _id: 'QWER',
        email: 'test@test.com',
        name: 'Test User',
        provider: 'local',
        role: 'user'
      };

      res = {
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

      $httpBackend.when('POST', '/auth/local').respond({ token: 'myToken' });
      $httpBackend.when('GET', '/api/users/me').respond(userData);

      Auth.login({ email: 'test@test.com', password: 'test' }); 
      $httpBackend.flush();


      $httpBackend.when('GET', /https\:\/\/www\.googleapis\.com\/youtube\/v3\/playlists\?.*/).respond(res.youtube);
      $httpBackend.when('GET', /\/api\/users\/.*\/classes/).respond(res.classQuery);
      $httpBackend.when('DELETE', /\/api\/users\/.*\/classes\/.*/).respond();
    }));


    it('should get all classes', function() {
      createController(); 

      $httpBackend.expectGET(/\/api\/users\/.*\/classes/);
      $httpBackend.expectGET(/https\:\/\/www\.googleapis\.com\/youtube\/v3\/playlists\?.*/);
      $httpBackend.flush();

      expect($rootScope.classes[0]._id).toEqual('QWER');
      expect($rootScope.classes[0].item).toBeDefined();
    });

    it('should have 1 decreased classes after to delete class', function() {
      createController(); 

      $httpBackend.flush();

      var beforeLength = $rootScope.classes.length;
      $rootScope.deleteClass($rootScope.classes[0]);

      $httpBackend.expectDELETE(/\/api\/users\/.*\/classes\/.*/);
      $httpBackend.flush();

      expect($rootScope.classes.length).toEqual(beforeLength - 1);
    });

  });
});
