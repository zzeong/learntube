'use strict';

describe('Controller: ToolbarCtrl', function () {
  beforeEach(module('learntubeApp'));
  var $scope;

  beforeEach(inject(function ($controller) {
    $scope = {};
    $controller('ToolbarCtrl', { $scope: $scope });
  }));

  it('should shows an account image when a google user logged in', inject(function () {
    var user = {
      google: {
        image: { url: 'https://foo.com/foo.jpg' }
      }
    };
    expect($scope.getUserImgPath(user)).toMatch(/https:\/\/*/);
  }));

  it('should shows a guest image when a local user logged in', inject(function () {
    var user = {};
    expect($scope.getUserImgPath(user)).toBe('/assets/images/guest.png');
  }));


});
