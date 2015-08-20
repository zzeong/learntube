'use strict';

angular.module('learntubeApp')
.controller('UploadedLectureList', function($scope, GData, GAuth, GApi, $stateParams, GoogleConst, $q) {
  $scope.playlistId = $stateParams.pid;

  var getAllPlaylistItems = function() {
    var listItems = [];
    var deferred = $q.defer();

    var recurse = function(nextToken) {
      var params = {
        part: 'snippet,status',
        playlistId: $scope.playlistId,
        maxResults: 50,
        fields: 'nextPageToken,items(snippet(publishedAt,thumbnails,title,resourceId),status)',
      };

      if(typeof nextToken === 'string') { params.pageToken = nextToken; }

      GApi.executeAuth('youtube', 'playlistItems.list', params)
      .then(function(res) {
        listItems = listItems.concat(res.items);
        if(res.nextPageToken) {
          recurse(res.nextPageToken);
        } else {
          deferred.resolve(listItems);
        }
      }); 
    };

    recurse();

    return deferred.promise;
  };

  var getDurationToList = function() {
    var joinedIds = $scope.playlistItems.map(function(item) {
      return item.snippet.resourceId.videoId;
    }).join(',');
    var params = {
      part: 'contentDetails', 
      id: joinedIds,
      fields: 'items(contentDetails(duration))',
    }; 

    GApi.executeAuth('youtube', 'videos.list', params)
    .then(function(res) {
      $scope.playlistItems = $scope.playlistItems.map(function(item, i) {
        item.contentDetails = res.items[i].contentDetails;
        return item;
      });
    });
  };

  if(!GData.isLogin()) {
    GAuth.login().then(function() {
      getAllPlaylistItems().then(function(allItems) {
        $scope.playlistItems = allItems;
        getDurationToList();
      }); 
    });
  } else {
    getAllPlaylistItems().then(function(allItems) {
      $scope.playlistItems = allItems;
      getDurationToList();
    }); 
  }

});
