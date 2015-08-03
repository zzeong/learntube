'use strict';


angular.module('learntubeApp')
.controller('ClassCtrl', function($scope, $http, $stateParams, $state) {

// 재생목록에 대한 정보 받아오기 (title, channelTitle, description)
$http.get('https://www.googleapis.com/youtube/v3/playlists', {
  params: {
    key: 'AIzaSyBUuJS30-hhEY8f_kMF3K3rX4qe_bkY3V8',
    part: 'snippet',
    id: 'PLgyxPQqhtaiu2smdVB7JO5zlh99yTmp35'
  }
}).success(function(response) {
  $scope.classe = response.items[0];
  console.log($scope.classe);

  $scope.desc = $scope.classe.snippet.description;

  

});



// 채널에 대한 정보 받아오기 (title, thumbnail, description)

$http.get('https://www.googleapis.com/youtube/v3/channels', {
  params: {
    key: 'AIzaSyBUuJS30-hhEY8f_kMF3K3rX4qe_bkY3V8',
    part: 'snippet',
    id: 'UCzw-C7fNfs018R1FzIKnlaA'
  }
}).success(function(response) {
  $scope.channel = response.items[0];
  console.log($scope.channel);
});


// 재생목록 아이템에 대한 정보 받아오기 (thumbnail, position, title)
$http.get('https://www.googleapis.com/youtube/v3/playlistItems', {
  params: {
    key: 'AIzaSyBUuJS30-hhEY8f_kMF3K3rX4qe_bkY3V8',
    part: 'snippet',
    playlistId: 'PLgyxPQqhtaiu2smdVB7JO5zlh99yTmp35',
    maxResults: '30' 
  }
}).success(function(response) {
  $scope.playlistItem = response.items;
  console.log($scope.playlistItem);

    // position == 0인 동영상의 ID가져오기
    $scope.firstVideoId = $scope.playlistItem[0].snippet.resourceId.videoId;


    // Master GURU's beautiful code!
    // (재생목록에 속한 모든 동영상의 아이디를 ,로 구분하여 foo에 저장)
    var list = $scope.playlistItem.map(function(el) {
      return el.snippet.resourceId.videoId;
    }).join(',');
    console.log(list);

            // 비디오 아이템에 대한 정보 받아오기 (duration)
            // (비공개 동영상도 여기까지는 전달된다)
            $http.get('https://www.googleapis.com/youtube/v3/videos', {
              params: {
                key: 'AIzaSyBUuJS30-hhEY8f_kMF3K3rX4qe_bkY3V8',
                part: 'contentDetails',
                id: list
              }
            }).success(function(response) {
              $scope.playlistInfo = response.items;
              console.log($scope.playlistInfo);


                // 필요한 정보 (thumbnail, position, title, duration을 얻기 위한 객체 배열생성)
                $scope.lecArr = [];

                for(var idx=0; idx<$scope.playlistItem.length; idx++){

                  $scope.lecObj  = {};

                  if($scope.playlistItem[idx].snippet.description === 'This video is private.'){
                    $scope.lecObj.thumbnail = 'http://static-2.nexusmods.com/15/mods/130/images/thumbnails/59126-0-1433258627.png';
                    $scope.lecObj.position =  $scope.playlistItem[idx].snippet.position;
                    $scope.lecObj.lectureTitle = 'Private Video';
                    $scope.lecObj.duration = ''; 
                    console.log('비디오 에러 발생! : ' + (idx+1) + '번째 동영상');
                  }/*else if($scope.playlistInfo[idx].contentDetails.duration === ){
                  
                  }*/else{                  
                    $scope.lecObj.thumbnail = $scope.playlistItem[idx].snippet.thumbnails.default.url;
                    $scope.lecObj.position =  $scope.playlistItem[idx].snippet.position;
                    $scope.lecObj.lectureTitle = $scope.playlistItem[idx].snippet.title;
                    $scope.lecObj.duration = $scope.playlistInfo[idx].contentDetails.duration;
                    $scope.lecObj.videoId = $scope.playlistItem[idx].snippet.resourceId.videoId;
                  }

                  $scope.lecArr.push($scope.lecObj);

                }
                console.log($scope.lecArr);

              });

});

// 새로운 배열을 만들어서, 그걸 repeat돌리자
// 타이틀을 빼오고, 재생시간을 빼와서 object배열로. 


    // show function구현
    //var change = true;    

    $scope.show=false;
    $scope.show2=false;
    $scope.content='view more';
    $scope.content2='view more';


    // javascript에서는 primitive type의 parameter를 받았을 때, 
    // 그것을 참조하는 것이 아니라 '복사' 하기 때문에 showProp으로
    // 다르게 받았다. 
    

    $scope.changeDesc = function(contentProp, showProp){
      $scope[showProp] = !$scope[showProp];

      if($scope[showProp] === false){
        $scope[contentProp]='view more';
      }else{
        $scope[contentProp]='simple view';
      }
      return $scope[showProp]; 

    }; 


    $scope.navigateTo = function(lecture) {
      console.log(lecture.videoId);
      $state.go('Lecture', { lid: lecture.videoId });
    };


  });

