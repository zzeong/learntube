'use strict';

xdescribe('Controller: WatchedLectureListCtrl', function () {
  beforeEach(module('learntubeApp'));
  var $scope, createController;

  beforeEach(inject(function ($controller) {
    $scope = {};
    createController = function () {
      return $controller('WatchedLectureListCtrl', { $scope: $scope });
    };
  }));


  describe('with HTTP', function () {
    var $httpBackend;

    beforeEach(inject(function (_$httpBackend_, $stateParams) {
      $httpBackend = _$httpBackend_;
      $stateParams.pid = 'PL12A65DE93A8357D6';

      var lecturelist = [{
        contentDetails: {
          duration: 'PT39M30S'
        },
        snippet: {
          publishedAt: new Date('October 13, 2014 11:13:00'),
          resourceId: {
            videoId: 'MYVIDEO1'
          },
        },
        status: {},
      }, {
        contentDetails: {
          duration: 'PT39M30S'
        },
        snippet: {
          publishedAt: new Date('October 14, 2014 11:13:00'),
          resourceId: {
            videoId: 'MYVIDEO1'
          },
        },
        status: {},
      }];

      var classes = [{
        _id: '!Q@W',
        lectures: [{
          videoId: 'MYVIDEO1',
        }, {
          videoId: 'MYVIDEO2',
        }],
      }, {
        _id: 'qaws',
        lectures: [{
          videoId: 'MYVIDEO3',
        }, {
          videoId: 'MYVIDEO4',
        }],
      }];

      var notes = [{
        _id: '!@#$',
        playlistId: 'PL12A65DE93A8357D6',
        videoId: 'ILOVEHER'
      }, {
        _id: 'SDFF',
        playlistId: 'PL12A65DE93A8357D6',
        videoId: 'SHELOVESME'
      }];

      var watchedLectures = {
        lectures: {
          videoId: 'MYVIDEO1'
        }
      };


      $httpBackend.when('GET', /\/api\/youtube\/lecture-list\?.*/).respond(lecturelist);
      $httpBackend.when('GET', /\/api\/users\/.*\/notes\?.*/).respond(notes);
      $httpBackend.when('GET', /\/api\/users\/.*\/classes\?.*/).respond(classes);
      $httpBackend.when('GET', /\/api\/users\/.*\/classes\/.*\/playlistId\?.*/).respond(watchedLectures);

    }));

    beforeEach(inject(function (Auth) {
      var userData = {
        __v: 0,
        _id: 'QWER',
        email: 'test@test.com',
        name: 'Test User',
        provider: 'local',
        role: 'user'
      };


      $httpBackend.when('POST', '/auth/local').respond({ token: 'myToken' });
      $httpBackend.when('GET', '/api/users/me').respond(userData);

      Auth.login({ email: 'test@test.com', password: 'test' });
      $httpBackend.flush();
    }));

    afterEach(inject(function (Auth) {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
      Auth.logout();
    }));

    it('should show notes when existing note is selected', function () {
      createController();
      $httpBackend.flush();

      var lecture = $scope.lectureList[0];
      $scope.showNote(lecture);

      $httpBackend.expectGET(/\/api\/users\/.*\/notes\?.*/);
      $httpBackend.flush();

      expect(lecture).toBeDefined('notes');
    });

    it('should show notes without request when same lecture is selected again', function () {
      createController();
      $httpBackend.flush();

      var lecture = $scope.lectureList[0];
      $scope.showNote(lecture);

      $httpBackend.expectGET(/\/api\/users\/.*\/notes\?.*/);
      $httpBackend.flush();

      $scope.showNote(lecture);
    });

    it('should show highlight mark on watched lectures', function () {
      createController();
      $httpBackend.expectGET(/\/api\/users\/.*\/classes\?.*/);
      $httpBackend.flush();

      var lecture = $scope.lectureList[0];

      expect(lecture.highlight).toEqual(true);
    });

  });
});
