'use strict';

angular.module('learntubeApp')
.controller('ClassCtrl', function($scope, $http, $stateParams, $state) {

  // 재생목록에 대한 정보 받아오기 (title, channelTitle, description)
  $http.get('https://www.googleapis.com/youtube/v3/playlists', {
    params: {
      key: 'AIzaSyBUuJS30-hhEY8f_kMF3K3rX4qe_bkY3V8',
      part: 'snippet',
      id: $scope.playlistId
    }
  }).success(function(response) {
    $scope.classe = response.items[0];
    $scope.desc = $scope.classe.snippet.description;
    $scope.channelId = $scope.classe.snippet.channelId;

    getLectureList();

  });


  // 재생목록 아이템에 대한 정보 받아오기 (thumbnail, position, title)

  $scope.lecArr = [];        

  function getLectureList(pageToken){
    $http.get('https://www.googleapis.com/youtube/v3/playlistItems', {
      params: {
        key: 'AIzaSyBUuJS30-hhEY8f_kMF3K3rX4qe_bkY3V8',
        part: 'snippet',
        playlistId: $scope.playlistId,
        maxResults: '10' ,
        pageToken: pageToken
      }
    }).success(function(response1) {
      $scope.playlistItem = response1.items;
      console.log(response1);

      // Master GURU's beautiful code!
      // (재생목록에 속한 모든 동영상의 아이디를 ,로 구분하여 list에 저장)
      var list = $scope.playlistItem.map(function(el) {
        return el.snippet.resourceId.videoId;
      }).join(',');
      console.log(list);



      // 비디오 아이템에 대한 정보 받아오기 (duration)
      // (비공개 동영상도 여기까지는 전달된다)
      $http.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
          key: 'AIzaSyBUuJS30-hhEY8f_kMF3K3rX4qe_bkY3V8',
          part: 'contentDetails, snippet',
          id: list
        }
      }).success(function(response2) {
        $scope.playlistInfo = response2.items;


        // 필요한 정보 (thumbnail, position, title, duration을 얻기 위한 객체 배열생성)
        for(var idx=0; idx<$scope.playlistItem.length; idx++){

          $scope.lecObj  = {};

          if($scope.playlistItem[idx].snippet.description === 'This video is private.'){
            $scope.lecObj.thumbnail = 'http://static-2.nexusmods.com/15/mods/130/images/thumbnails/59126-0-1433258627.png';
            $scope.lecObj.lectureTitle = '<< Private Video >>';
            $scope.lecObj.duration = ''; 
            $scope.lecObj.index = '';
            $scope.lecObj.date = $scope.playlistInfo[idx].snippet.publishedAt;
            console.log('비공개 비디오 발생! : ' + (idx+1) + '번째 동영상');
          }else{                  
            $scope.lecObj.thumbnail = $scope.playlistItem[idx].snippet.thumbnails.default.url;
            $scope.lecObj.lectureTitle = $scope.playlistItem[idx].snippet.title;
            $scope.lecObj.duration = $scope.playlistInfo[idx].contentDetails.duration;
            $scope.lecObj.videoId = $scope.playlistItem[idx].snippet.resourceId.videoId;
            $scope.lecObj.index = '';
            $scope.lecObj.date = $scope.playlistInfo[idx].snippet.publishedAt;
          }

          //lecArr 구성
          $scope.lecArr.push($scope.lecObj);
          //console.log($scope.lecArr.length);
        }


        // 재귀함수 호출해야 하는 지점
        if(response1.nextPageToken === undefined){
          console.log('it is done');

        }else{
          console.log('lets go to getLectureList');
          getLectureList(response1.nextPageToken);
        }

        // 받아온 모든 동영상을 날짜순으로 정렬 (lecArr ▶ lecArrSorting)
        // ★ lodash의 사용 ★
        $scope.lecArrSorting = _.sortBy($scope.lecArr, function(el) {
          return el.date;
        });

        // 전체 재생시간 변수생성
        var totalDuration=0;

        // 동영상 position 부여
        for(var k=0; k<$scope.lecArrSorting.length; k++){

          $scope.lecArrSorting[k].index = k+1;

          // 전체 재생시간 구하기
          // ※ 정규표현식에 대한 공부가 필요하다 ※
          var time = $scope.lecArrSorting[k].duration;
          time = /PT([0-9]?.)M([0-9]?.)S/.exec(time);
          //console.log(time);

          var min = time[1];
          var sec = time[2];


          totalDuration = totalDuration + parseInt(min)*60 + parseInt(sec);

        }


        $scope.totalDurationObj = {};
        $scope.totalDurationObj.min = parseInt(totalDuration/60);
        $scope.totalDurationObj.sec = (totalDuration%60);


        //position == 0인 동영상의 ID가져오기
        $scope.firstVideoId = $scope.lecArrSorting[0].videoId; 


      });


    });


  }




  // 채널에 대한 정보 받아오기 (title, thumbnail, description)

  $http.get('https://www.googleapis.com/youtube/v3/channels', {
    params: {
      key: 'AIzaSyBUuJS30-hhEY8f_kMF3K3rX4qe_bkY3V8',
      part: 'snippet',
      id: $scope.channelId
    }
  }).success(function(response) {
    $scope.channel = response.items[0];
    console.log($scope.channel);
  });



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
      $scope[contentProp]='view less';
    }
    return $scope[showProp]; 

  }; 


  $scope.navigateTo = function(lecture) {
    console.log(lecture.videoId);
    $state.go('Lecture', { lid: lecture.videoId });
  };


});

