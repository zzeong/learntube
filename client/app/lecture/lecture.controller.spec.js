'use strict';

describe('Controller: LectureCtrl', function () {
  beforeEach(module('learntubeApp')); 
  var LectureCtrl, $rootScope, createController;

  beforeEach(inject(function ($injector) {
    $rootScope = $injector.get('$rootScope');
    var $controller = $injector.get('$controller');

    createController = function() {
      return $controller('LectureCtrl', {'$scope' : $rootScope });
    };
  }));

  it('should get video id in URI-parameter', inject(function($stateParams) {
    var controller = createController();
    expect($rootScope.videoId).toBe($stateParams.vid);
  }));

  it('should be able to toggle note editor', inject(function() {
    var controller = createController();
    expect($rootScope.isNoteOn).toBe(false); 
    $rootScope.toggleNote();
    expect($rootScope.isNoteOn).toBe(true);
    $rootScope.toggleNote();
    expect($rootScope.isNoteOn).toBe(false);
  }));

  describe('with HTTP', function() {
    var youtubeReqHandler, $httpBackend, params, resultItems;
    beforeEach(inject(function(_$httpBackend_) {
      $httpBackend = _$httpBackend_;

      resultItems = {
        items: [{
          snippet: {
            title: 'hello' 
          }
        }] 
      };

      params = _.map({
        key: 'AIzaSyBUuJS30-hhEY8f_kMF3K3rX4qe_bkY3V8',
        part: 'snippet,contentDetails'
      }, function(val, key) {
        return key + '=' + val; 
      }).join('&');

      youtubeReqHandler = $httpBackend.when('GET','https://www.googleapis.com/youtube/v3/videos?' + params)
      .respond(resultItems);

      $httpBackend.when('POST', '/api/users/notes').respond({ message: 'success' });
      $httpBackend.when('POST', /\/api\/users\/.*\/classes/).respond({ _id: 'QWER'  });
      $httpBackend.when('POST', /\/api\/users\/.*\/classes\/.*\/lectures/).respond({ _id: 'QWERT' });
    })); 

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });


    it('should assign item which YouTube API responsed to scope item', inject(function($stateParams) {
      $httpBackend.expectGET('https://www.googleapis.com/youtube/v3/videos?' + params);
      var controller = createController();
      $httpBackend.flush();
      expect($rootScope.item).toEqual(resultItems.items[0]); 
    }));

    it('should receive note which user have written from Note API', inject(function(_$log_) {
      $httpBackend.expectGET('https://www.googleapis.com/youtube/v3/videos?' + params)
      var controller = createController();
      $httpBackend.flush();
      $rootScope.videoId = '234';
      $rootScope.note = '<h1>Hi</h1>';
      $httpBackend.expectPOST('/api/users/notes');
      var $log = _$log_;

      $rootScope.doneNote();
      $httpBackend.flush();
      expect($log.info.logs).toContain(['success']);
    }));

    it('should save current lecture with class', inject(function(_$log_) {
      $httpBackend.expectGET('https://www.googleapis.com/youtube/v3/videos?' + params)
      var controller = createController();
      $httpBackend.flush();

      $httpBackend.expectPOST(/\/api\/users\/.*\/classes/);
      $httpBackend.expectPOST(/\/api\/users\/.*\/classes\/.*\/lectures/);
      var $log = _$log_;
      $rootScope.completeLecture();
      $httpBackend.flush();
      expect($log.info.logs).toContain(['Saved Lecture']);
    }));
  });
});
