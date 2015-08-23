'use strict';

describe('Controller: ToolbarCtrl', function () { 
  beforeEach(module('learntubeApp')); 
  var $scope;

  beforeEach(inject(function ($controller) {
    $scope = {};
    $controller('ToolbarCtrl', { $scope: $scope });
  }));

  it('검색 상태를 전환시켜야 한다', inject(function() {
    var onSearching = $scope.onSearching;
    $scope.toggleSearchingState();

    expect($scope.focusInput).toEqual(true);
    expect($scope.onSearching).toEqual(!onSearching);
  }));

  it('Home이 아닌 페이지에서는 Toolbar 왼쪽 기능 버튼이 back이 되어야 한다', inject(function($state) {
    $state.current.name = 'NotHome';
    var backIconPath = '/assets/images/back.svg';
    expect($scope.leftIconChanger()).toEqual(backIconPath);
  }));
  it('Home 페이지에서는 Toolbar 왼쪽 기능 버튼이 menu가 되어야 한다', inject(function($state) {
    $state.current.name = 'Home';
    var menuIconPath = '/assets/images/menu.svg';
    expect($scope.leftIconChanger()).toEqual(menuIconPath);
  }));

  it('로그인 상태에서 회원 이미지를 보여주어야 한다', inject(function() {
    var user = {
      google: {
        image: { url: 'https://foo.com/foo.jpg' } 
      } 
    };
    expect($scope.getUserImgPath(user)).toMatch(/https:\/\/*/);
  }));
  
  it('로그인 상태에서 비구글 회원은 guest 이미지를 보여주어야 한다', inject(function() {
    var user = {}; 
    expect($scope.getUserImgPath(user)).toBe('/assets/images/guest.png');
  }));


});
