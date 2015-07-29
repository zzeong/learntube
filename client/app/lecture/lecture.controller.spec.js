'use strict';

describe('Controller: LectureCtrl는', function () {

  // load the controller's module
  beforeEach(module('learntubeApp')); 
  var LectureCtrl, $scope, dummy, $httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    dummy = {
      items: [{
        snippet: {
          title: 'hello' 
        }
      }] 
    };

    $scope = $rootScope.$new();
    LectureCtrl = $controller('LectureCtrl', {
      $scope: $scope
    });
  }));

  it('매개변수의 videoId를 받아와야 한다', inject(function($stateParams) {
    expect($scope.videoId).toBe($stateParams.vid);
  }));

  it('scope item에 youtube api의 결과 item을 할당시켜야 한다', inject(function($stateParams, _$httpBackend_) {
    var params = {
      key: 'AIzaSyBUuJS30-hhEY8f_kMF3K3rX4qe_bkY3V8',
      part: 'snippet,contentDetails'
    };

    params = _.map(params, function(val, key) {
      return key + '=' + val; 
    }).join('&');
    
    $httpBackend = _$httpBackend_;
    $httpBackend.expectGET('https://www.googleapis.com/youtube/v3/videos?' + params)
    .respond(dummy);
    $httpBackend.flush();
    expect($scope.item).toEqual(dummy.items[0]); 
  }));

  it('필기 에디터를 토글할 수 있어야 한다', inject(function() {
    expect($scope.isNoteOn).toBe(false); 
    $scope.toggleNote();
    expect($scope.isNoteOn).toBe(true);
    $scope.toggleNote();
    expect($scope.isNoteOn).toBe(false);
  }));
});
