'use strict';

angular.module('learntubeApp')
.controller('ToolbarCtrl', function ($scope, $location, $state, $window, Auth, navToggler, $filter, Category) {


  // url에서 Toolbar title을 받아오자
  $scope.categoryTitle = _.find(Category.name, (name) => {
    return _.isEqual($filter('urlSafely')(name.orig), $state.params.ctname);
  });

  // pageWidth를 측정하여 툴바 모양 결정
  $scope.pageWidth = document.documentElement.clientWidth;

  var getMobileTitle = function () {
    var title = _.has($state.current, 'data') ? $state.current.data.pageName : '';
    if ($scope.pageWidth < 600) {

      title = $scope.stateNameCheck('search') ? $state.params.q : title;
    } else {
      if ($scope.stateNameCheck('search') === true) {
        title = 'search';
      } else if ($scope.stateNameCheck('category-other') === true) {
        title = $scope.categoryTitle.orig;
      } else {
        title = title;
      }
    }
    return title;
  };


  // search input에 대한 판단
  var getOnSearching = function () {
    var onSearching;

    if ($scope.pageWidth < 600) {
      onSearching = $scope.stateNameCheck('search') ? true : false;
      $scope.webSearchIcon = false;
      $scope.clearIcon = $scope.stateNameCheck('search') ? true : false;
    } else {
      onSearching = true;
      $scope.webSearchIcon = true;
      $scope.clearIcon = false;
    }

    return onSearching;
  };



  // page title에 대한 판단
  var getSearchAtMobile = function () {
    var searchAtMobile;

    if ($scope.pageWidth < 600) {
      searchAtMobile = $scope.stateNameCheck('search') ? true : false;
    } else {
      searchAtMobile = false;
    }

    return searchAtMobile;
  };

  // greyToolbar를 onSearching과 분리시킴 (web구현으로 인한 선택)
  // mobile = onsearching에 따라 툴바의 색이 결정되지만,
  // web = search.html이 열렸냐에 따라 툴바의 색이 결정됨
  var getGreyToolbar = function () {
    var greyToolbar;
    if ($scope.pageWidth < 600) {
      greyToolbar = ($scope.onSearching === true) ? true : false;
    } else {
      if ($scope.stateNameCheck('search')) {
        greyToolbar = true;
      } else {
        greyToolbar = false;
        $scope.yellowInput = true;
      }
    }

    return greyToolbar;
  };

  $scope.loginOauth = function (provider) {
    $window.location.href = '/auth/' + provider;
  };

  $scope.hidemenu = false;
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
    $scope.onSearching = !$scope.onSearching;
    $scope.hidemenu = !$scope.hidemenu;
    $scope.focusInput = true;
    $scope.greyToolbar = !$scope.greyToolbar;
    $scope.searchAtMobile = !$scope.searchAtMobile;
    $scope.clearIcon = true;
  };

  $scope.stateNameCheck = function (name) {
    return $state.current.name === name;
  };

  $scope.title = getMobileTitle();
  $scope.onSearching = getOnSearching();
  console.log($scope.onSearching);
  $scope.searchAtMobile = getSearchAtMobile();
  $scope.greyToolbar = getGreyToolbar();

  $scope.mainIconTrigger = function () {
    navToggler.left();
  };
  $scope.getUserImgPath = function (user) {
    var guestImgPath = '/assets/images/guest.png';
    return _.has(user, 'google') ? user.google.image.url : guestImgPath;
  };
  $scope.logout = function () {
    Auth.logout();
    $location.path('/');
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
