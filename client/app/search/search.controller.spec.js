'use strict';

describe('Controller: SearchCtrl', function () {
  beforeEach(module('learntubeApp'));
  var $scope, respond, $httpBackend;

  beforeEach(inject(function ($controller, _$httpBackend_) {
    $httpBackend = _$httpBackend_;
    $scope = {};
    
    var respond = [{}, {}];
    $httpBackend.when('GET', 'app/main/main.html').respond(200);
    $httpBackend.when('GET', /https\:\/\/www\.googleapis\.com\/youtube\/v3\/search\?.*/).respond(respond);

    $controller('SearchCtrl', { $scope: $scope });
  }));

  it('should get searched classes', function() {
    $scope.q = 'cats';
    $httpBackend.expectGET(/https\:\/\/www\.googleapis\.com\/youtube\/v3\/search\?.*/);
    $httpBackend.flush();

    expect($scope.classes).toEqual(respond);
  });
});

