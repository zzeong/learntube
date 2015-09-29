'use strict';

angular.module('learntubeApp')
.controller('WatchedContentsCtrl', function ($scope, $http, ClassAPI, NoteAPI, $state, $log, GoogleConst, GApi) {
  ClassAPI.query(function (response) {
    $scope.classes = response;

    var playlistIds = $scope.classes.map(function (el) {
      return el.playlistId;
    }).join(',');

    GApi.execute('youtube', 'playlists.list', {
      key: GoogleConst.browserKey,
      part: 'snippet,contentDetails',
      id: playlistIds,
      fields: 'items(snippet(title,thumbnails),contentDetails)',
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
        console.log(classe);
        return classe;
      });
    });
  });



  $scope.deleteClass = function (classe) {
    ClassAPI.remove({ cid: classe._id }, function () {
      _.remove($scope.classes, classe);
    });
  };

  $scope.showGraph = function (classe) {
    var img = document.getElementById('thumbnail');
    classe.imgWidth = img.width;
    classe.imgHeight = img.height;

    // DB에서 시청한 동영상 목록 가져오기 (seenLectures)
    ClassAPI.query({playlistId: classe.playlistId}, function (response) {
      classe.numberOfWatched = response[0].lectures.length;
      classe.percentage = ((classe.numberOfWatched / classe.item.contentDetails.itemCount) * 100).toPrecision(3);
    }, function (err) {
      $log.error(err);
    });


    // DB에서 필기 목록 가져오기 (Note)
    NoteAPI.query({playlistId: classe.playlistId}, function (response) {
      classe.numberOfNote = response.length;
    }, function (err) {
      $log.error(err);
    });

    classe.graph = !classe.graph;

  };
});
