'use strict';


// 재생목록에 대한 정보 받아오기 (title, channelTitle, description)
angular.module('learntubeApp')
.controller('ClassCtrl', function($scope, $http, $stateParams) {
  $http.get('https://www.googleapis.com/youtube/v3/playlists', {
    params: {
      key: 'AIzaSyBUuJS30-hhEY8f_kMF3K3rX4qe_bkY3V8',
      part: 'snippet',
      id: 'PL9B61DEF63FC19BD9'
    }
  }).success(function(response) {
    $scope.classe = response.items[0];
    console.log($scope.classe);
  });

// 재생목록 아이템에 대한 정보 받아오기 (position, title)
$http.get('https://www.googleapis.com/youtube/v3/playlistItems', {
    params: {
      key: 'AIzaSyBUuJS30-hhEY8f_kMF3K3rX4qe_bkY3V8',
      part: 'snippet',
      playlistId: 'PL9B61DEF63FC19BD9',
      maxResults: '10'
    }
  }).success(function(response) {
    $scope.playlist_item = response.items;
    console.log($scope.playlist_item);
    
    // Master GURU's beautiful code!
    var foo = $scope.playlist_item.map(function(el) {
        return el.snippet.resourceId.videoId;
    }).join(',');
    console.log(foo);

            // 비디오 아이템에 대한 정보 받아오기 (duration)
            $http.get('https://www.googleapis.com/youtube/v3/videos', {
                params: {
                  key: 'AIzaSyBUuJS30-hhEY8f_kMF3K3rX4qe_bkY3V8',
                  part: 'contentDetails',
                  id: foo
                }
              }).success(function(response) {
                $scope.playlist_info = response.items;
                console.log($scope.playlist_info);


                // 필요한 정보 (thumbnail, position, title, duration을 얻기 위한 객체 배열생성)
                $scope.lecArr = [];

                for(var idx=0; idx<$scope.playlist_item.length; idx++){
                  
                  $scope.lecObj  = {};
                  $scope.lecObj.thumbnail = $scope.playlist_item[idx].snippet.thumbnails.default.url;
                  $scope.lecObj.position =  $scope.playlist_item[idx].snippet.position;
                  $scope.lecObj.lectureTitle = $scope.playlist_item[idx].snippet.title;
                  $scope.lecObj.duration = $scope.playlist_info[idx].contentDetails.duration;

                  $scope.lecArr.push($scope.lecObj);

                }
                console.log($scope.lecArr);



              });

  


  });

// 새로운 배열을 만들어서, 그걸 repeat돌리자
// 타이틀을 빼오고, 재생시간을 빼와서 object배열로. 


});




