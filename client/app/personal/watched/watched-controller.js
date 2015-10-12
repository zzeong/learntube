'use strict';

angular.module('learntubeApp')
.controller('WatchedContentsCtrl', function ($scope, $http, Class, Note, $state, GoogleConst, GApi) {
  Class.query()
  .$promise
  .then(function (response) {
    $scope.classes = response;

    var playlistIds = $scope.classes.map(function (el) {
      return el.playlistId;
    }).join(',');

    return GApi.execute('youtube', 'playlists.list', {
      key: GoogleConst.browserKey,
      part: 'snippet,contentDetails',
      id: playlistIds,
      fields: 'items(snippet(title,thumbnails),contentDetails)',
    });
  })
  .then(function (responseFromYT) {
    $scope.classes = $scope.classes.map(function (classe, i) {
      classe.item = responseFromYT.items[i];
      classe.graph = false;
      classe.imgWidth = 0;
      classe.imgHeight = 0;
      classe.numberOfWatched = 0;
      classe.numberOfNote = 0;
      classe.percentage = 0;
      return classe;
    });
  })
  .catch(console.error);



  $scope.deleteClass = function (classe) {
    Class.remove({ cid: classe._id })
    .$promise
    .then(function () {
      _.remove($scope.classes, classe);
    })
    .catch(console.error);
  };

  $scope.showGraph = function (classe) {
    var img = document.getElementById('thumbnail');
    classe.imgWidth = img.width;
    classe.imgHeight = img.height;

    // DB에서 시청한 동영상 목록 가져오기 (seenLectures)
    Class.query({ playlistId: classe.playlistId })
    .$promise
    .then(function (response) {
      classe.numberOfWatched = response[0].lectures.length;
      classe.percentage = ((classe.numberOfWatched / classe.item.contentDetails.itemCount) * 100).toPrecision(3);
    })
    .catch(console.error);


    // DB에서 필기 목록 가져오기 (Note)
    Note.query({ playlistId: classe.playlistId })
    .$promise
    .then(function (response) {
      classe.numberOfNote = response.length;
    })
    .catch(console.error);

    classe.graph = !classe.graph;

  };
});
