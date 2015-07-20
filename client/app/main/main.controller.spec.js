'use strict';

describe('Controller: MainCtrl', function () {

  // load the controller's module
  beforeEach(module('learntubeApp'));

  var MainCtrl,
      scope,
      $httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MainCtrl = $controller('MainCtrl', {
      $scope: scope
    });
  }));

  it('scope에 검색 기본값을 가지고 있어야 한다', function() {
    //expect(scope.q).toBe('cats');
  });
});
