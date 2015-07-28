'use strict';

describe('Controller: LectureCtrl는', function () {

  // load the controller's module
  beforeEach(module('learntubeApp')); 
  var LectureCtrl, $scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    $scope = $rootScope.$new();
    LectureCtrl = $controller('LectureCtrl', {
      $scope: $scope
    });
  }));

  it('매개변수의 videoId를 받아와야 한다', inject(function($stateParams) {
    expect($scope.videoId).toBe($stateParams.vid);
  }));
});
