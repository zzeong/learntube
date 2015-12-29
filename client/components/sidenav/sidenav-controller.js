'use strict';

angular.module('learntubeApp')
.controller('SidenavCategoryCtrl', SidenavCategoryCtrl)
.controller('SidenavNoteCtrl', SidenavNoteCtrl);

function SidenavCategoryCtrl($scope, Category, $state, $filter) {
  $scope.href = $state.href.bind(null);
  $scope.categories = Category.name;
  $scope.getSafeUrl = function (string) {
    return $filter('urlSafely')(string);
  };
}

function SidenavNoteCtrl() {

}
