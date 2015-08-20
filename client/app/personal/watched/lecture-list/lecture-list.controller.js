'use strict';

angular.module('learntubeApp')
.controller('LectureListCtrl', function($scope, $http, $stateParams, $state, $log) {

 getLectureList();

  $scope.lecArr = [];

 function getLectureList(pageToken) {
  $http.get('https://www.googleapis.com/youtube/v3/playlistItems', {
    params: {
      key: 'AIzaSyBUuJS30-hhEY8f_kMF3K3rX4qe_bkY3V8',
      part: 'snippet',
      playlistId: 'PL9F834D13468AFB1F',
      maxResults: '50',
      pageToken: pageToken
    }
  }).success(function(response1) {

    $scope.playlistItem = response1.items;
        //console.log(response1);

        // Master GURU's beautiful code!
        // (재생목록에 속한 모든 동영상의 아이디를 ,로 구분하여 list에 저장)
        var list = $scope.playlistItem.map(function(el) {
          return el.snippet.resourceId.videoId;
        }).join(',');
        console.log(list);


        // 비디오 아이템에 대한 정보 받아오기 (duration)
        $http.get('https://www.googleapis.com/youtube/v3/videos', {
          params: {
            key: 'AIzaSyBUuJS30-hhEY8f_kMF3K3rX4qe_bkY3V8',
            part: 'contentDetails, snippet',
            id: list
          }
        }).success(function(response2) {

          $scope.playlistInfo = response2.items;
          console.log($scope.playlistInfo);

          // 필요한 정보 (thumbnail, position, title, duration을 얻기 위한 객체 배열생성)
          for (var idx = 0; idx < $scope.playlistInfo.length; idx++) {
            console.log(idx, $scope.playlistInfo[idx]);

            $scope.lecObj = {};
            // 여기는 비공개 동영상 처리를 위한 부분이었지만 필요가 없어졌다. but 일단 남겨놓기로 한다.
            /*if ($scope.playlistInfo[idx].snippet.title === 'Private video') {
              $scope.lecObj.thumbnail = 'http://static-2.nexusmods.com/15/mods/130/images/thumbnails/59126-0-1433258627.png';
              $scope.lecObj.lectureTitle = '<< Private Video >>';
              $scope.lecObj.duration = 'PT0M0S';
              $scope.lecObj.index = '';
              $scope.lecObj.date = $scope.playlistInfo[idx].snippet.publishedAt;
              $scope.lecObj.ptM = '';
              $scope.lecObj.ptS = '';
              console.log('비공개 비디오 발생! : ' + (idx + 1) + '번째 동영상');
            }else {*/
              $scope.lecObj.thumbnail = $scope.playlistInfo[idx].snippet.thumbnails.default.url;
              $scope.lecObj.lectureTitle = $scope.playlistInfo[idx].snippet.title;
              $scope.lecObj.duration = $scope.playlistInfo[idx].contentDetails.duration;
              $scope.lecObj.videoId = $scope.playlistItem[idx].snippet.resourceId.videoId;
              $scope.lecObj.index = '';
              $scope.lecObj.date = $scope.playlistInfo[idx].snippet.publishedAt;
              $scope.lecObj.ptM = '';
              $scope.lecObj.ptS = '';
            //}



            //lecArr 구성
            $scope.lecArr.push($scope.lecObj);
            //console.log($scope.lecArr.length);
          }

          // 재귀함수 호출해야 하는 지점
          if (response1.nextPageToken === undefined) {
            console.log('it is done');
          } else {
            console.log('lets go to getLectureList');
            getLectureList(response1.nextPageToken);
          }

          // 받아온 모든 동영상을 날짜순으로 정렬 (lecArr ▶ lecArrSorting)
          // ★ lodash의 사용 ★
          $scope.lecArrSorting = _.sortBy($scope.lecArr, function(el) {
            return el.date;
          });

          // 전체 재생시간 변수생성
          var totalDuration = 0;

          // 동영상 position 부여
          for (var k = 0; k < $scope.lecArrSorting.length; k++) {

            $scope.lecArrSorting[k].index = k + 1;

            // 전체 재생시간 구하기
            // ※ 정규표현식에 대한 공부가 필요하다 ※
            var time = $scope.lecArrSorting[k].duration;
            time = time.replace('P', '');
            time = time.replace('T', '');
            time = time.replace('S', '');
            time = time.split('M');

            // time에서 문자를 없애고 숫자만 남기는 정규표현식
            // time = /PT([0-9]?.)M([0-9]?.)S/.exec(time);

            var min = time[0];
            var sec = time[1];

            $scope.lecArrSorting[k].ptM = min + ':';
            if (sec === '') {
              $scope.lecArrSorting[k].ptS = '';
            } else {
              $scope.lecArrSorting[k].ptS = sec;
            }

            if (sec === '') {
              totalDuration = totalDuration + parseInt(min) * 60;
            } else {
              totalDuration = totalDuration + parseInt(min) * 60 + parseInt(sec);
            }
            //console.log('totalDuration = ' + totalDuration);

          }

          $scope.totalDurationObj = {};
          $scope.totalDurationObj.hour = parseInt(totalDuration / 3600);
          $scope.totalDurationObj.min = parseInt((totalDuration % 3600) / 60);
          $scope.totalDurationObj.sec = (totalDuration % 60);


          //position == last인 동영상의 ID가져오기
          $scope.firstVideoId = $scope.lecArrSorting[$scope.lecArrSorting.length-1].videoId;

        });

      });

      // line 43 (getLectureList method)
    }


  });










