'use strict';

angular.module('learntubeApp')
.controller('ToolbarCtrl', function ($scope, $location, $state, $window, Auth, NavToggler, $filter, Category, ToolbarService) {
  $scope.logout = Auth.logout;


  // url에서 Toolbar title을 받아오자 (카테고리 이름)
  $scope.categoryTitle = _.find(Category.name, (name) => {
    return _.isEqual($filter('urlSafely')(name.orig), $state.params.ctname);
  });

  // pageWidth를 측정하여 툴바 모양 결정
  $scope.pageWidth = document.documentElement.clientWidth;

  var classTitle = ToolbarService.getClassTitle();

  var getTitle = function () {
    var title = _.has($state.current, 'data') ? $state.current.data.pageName : '';
    if ($scope.stateNameCheck('category-other') === true) {
      title = $scope.categoryTitle.orig;
    } else if ($scope.stateNameCheck('search') === true) {
      if ($scope.pageWidth < 600) {
        title = $state.params.q;
      } else {title = 'search';}
    } else if ($scope.stateNameCheck('watched-lecture-list') === true || $scope.stateNameCheck('uploaded-lecture-list') === true) {
      title = classTitle;
    } else {
      title = title;
    }

    return title;
  };

  // search at mobile
  var getSearchAtMobile = function () {
    var searchAtMobile;

    if ($scope.pageWidth < 600) {
      searchAtMobile = $scope.stateNameCheck('search') ? true : false;
    } else {
      searchAtMobile = false;
    }

    return searchAtMobile;
  };

  var getGreyToolbar = function () {
    var greyToolbar;

      if ($scope.stateNameCheck('search')) {
        greyToolbar = true;
      } else {
        greyToolbar = false;
        $scope.yellowInput = true;
      }

    return greyToolbar;
  };

  $scope.loginOauth = function (provider) {
    console.log('google oauth');
    $window.location.href = '/auth/' + provider;
  };

  $scope.getCurrentUser = Auth.getCurrentUser;
  $scope.isLoggedIn = Auth.isLoggedIn;
  $scope.personalMenu = [{
    name: 'Watched contents',
    url: $state.href('watched-contents'),
  }, {
    name: 'Uploaded contents',
    url: $state.href('uploaded-contents'),
  }];

  $scope.toggleSearchingState = function () {
    $scope.searchAtMobile = !$scope.searchAtMobile;
  };

  $scope.stateNameCheck = function (name) {
    return $state.current.name === name;
  };

  $scope.title = getTitle();
  $scope.searchAtMobile = getSearchAtMobile();
  $scope.greyToolbar = getGreyToolbar();


  $scope.mainIconTrigger = function () {
    NavToggler.left();
  };
  $scope.getUserImgPath = function (user) {
    var guestImgPath = '/assets/images/guest.png';
    return _.has(user, 'google') ? user.google.image.url : guestImgPath;
  };

  $scope.deleteValue = function () {
    $scope.q = null;
    $scope.focusElement = 'input1';
  };

  $scope.goBackward = function () {
    if ($scope.stateNameCheck('search') ? true : false) {
      window.history.back();
    } else {
      $scope.toggleSearchingState();
    }
  };

});
