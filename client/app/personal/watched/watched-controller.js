'use strict';

angular.module('learntubeApp')
.controller('WatchedContentsCtrl', function ($scope, $http, WatchedContent, Note, $state, GoogleConst, GApi) {
  $scope.href = $state.href.bind(null);

  WatchedContent.query().$promise
  .then(function (response) {
    $scope.classes = response;

    var playlistIds = $scope.classes.map(function (el) {
      return el.playlistId;
    }).join(',');

    return GApi.execute('youtube', 'playlists.list', {
      key: GoogleConst.browserKey,
      part: 'id,snippet,contentDetails',
      id: playlistIds,
      fields: 'items(id,snippet(title,thumbnails),contentDetails)',
    });
  })
  .then(function (res) {
    var extraData = _(res.items)
    .groupBy('id')
    .forEach(function (val, key, iteratee) {
      iteratee[key] = val.map(function (item) {
        return {
          title: item.snippet.title,
          videoCount: item.contentDetails.itemCount,
          thumbnailUrl: item.snippet.thumbnails.medium.url,
        };
      })[0];
    })
    .value();

    $scope.classes = $scope.classes.map(function (classe) {
      classe = _.assign(classe, extraData[classe.playlistId]);
      classe.watchingRatio = classe.lectures.length / classe.videoCount;
      return classe;
    });
  })
  .catch(console.error);

  $scope.deleteClass = function (classe) {
    WatchedContent.remove({ cid: classe._id }).$promise
    .then(function () {
      _.remove($scope.classes, classe);
    })
    .catch(console.error);
  };
});
