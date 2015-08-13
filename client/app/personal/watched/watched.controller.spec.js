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
    var $httpBackend, resultItems, youtubeResult, params; 

    beforeEach(inject(function(_$httpBackend_) {
      $httpBackend = _$httpBackend_; 

      resultItems = [{
        userId: '123',
        playlistId: 'Q1W2'
      }, {
        userId: '123',
        playlistId: 'E3R4'
      }];

      youtubeResult = { items: [{}, {}] };

      params = _.map({
        key: 'AIzaSyBUuJS30-hhEY8f_kMF3K3rX4qe_bkY3V8',
        part: 'snippet,contentDetails',
        id:'Q1W2,E3R4',
        fields: 'items(snippet(title,thumbnails))',
      }, function(val, key) {
        return key + '=' + val; 
      }).join('&');

      $httpBackend.when('GET',/https\:\/\/www\.googleapis\.com\/youtube\/v3\/playlists\?.*/)
      .respond(youtubeResult);

      $httpBackend.when('GET', /\/api\/users\/classes/).respond(resultItems);
    }));

    it('should get all classes from class API at first', function() {
      var controller = createController(); 
      $httpBackend.expectGET(/\/api\/users\/classes/);
      $httpBackend.expectGET(/https\:\/\/www\.googleapis\.com\/youtube\/v3\/playlists\?.*/);
      $httpBackend.flush();
      expect(angular.equals($rootScope.myClasses, resultItems)).toBe(true);
      expect(angular.equals($rootScope.classes, youtubeResult.items)).toBe(true);
    });
  });
});
