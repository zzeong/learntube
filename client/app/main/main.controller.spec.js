'use strict';

describe('Controller: MainCtrl', function () {
  beforeEach(module('learntubeApp'));
  var $scope;

  beforeEach(inject(function ($controller) {
    $scope = {};
    $controller('MainCtrl', { $scope: $scope });
  }));
});
