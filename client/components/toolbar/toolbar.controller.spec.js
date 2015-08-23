'use strict';

describe('Controller: ToolbarCtrl', function () { 
  beforeEach(module('learntubeApp')); 
  var $scope;

  beforeEach(inject(function ($controller) {
    $scope = {};
    $controller('ToolbarCtrl', { $scope: $scope });
  }));

  it('should change searching status', inject(function() {
    var onSearching = $scope.onSearching;
    $scope.toggleSearchingState();

    expect($scope.focusInput).toEqual(true);
    expect($scope.onSearching).toEqual(!onSearching);
  }));

  it('should makes left function be back button in NOT main page', inject(function($state) {
    $state.current.name = 'NotHome';
    var backIconPath = '/assets/images/back.svg';
    expect($scope.leftIconChanger()).toEqual(backIconPath);
  }));

  it('should makes left function be menu button in main page', inject(function($state) {
    $state.current.name = 'Home';
    var menuIconPath = '/assets/images/menu.svg';
    expect($scope.leftIconChanger()).toEqual(menuIconPath);
  }));

  it('should shows an account image when a google user logged in', inject(function() {
    var user = {
      google: {
        image: { url: 'https://foo.com/foo.jpg' } 
      } 
    };
    expect($scope.getUserImgPath(user)).toMatch(/https:\/\/*/);
  }));
  
  it('should shows a guest image when a local user logged in', inject(function() {
    var user = {}; 
    expect($scope.getUserImgPath(user)).toBe('/assets/images/guest.png');
  }));


});
