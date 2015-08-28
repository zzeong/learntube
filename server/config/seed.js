/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var User = require('../api/user/user.model');
var Note = require('../api/user/note/note.model');
var Class = require('../api/user/class/class.model');

User.find({}).remove(function() {
  User.create({
    provider: 'local',
    name: 'Test User',
    email: 'test@test.com',
    password: 'test',
  }, {
    provider: 'local',
    role: 'admin',
    name: 'Admin',
    email: 'admin@admin.com',
    password: 'admin'
  }, function(err, user) {

    // Note Test URL: http://localhost:9000/class/PL2jcQseI9PWJoKqqIhOyNE9r_F4IpCf4t/lecture/5G229--2HJ4
    Note.find({}).remove(function() {
      Note.create({
        userId: user._id,
        videoId: '5G229--2HJ4',
        hash: '7121cd645707ec47efa33393028473c7',
        url: 'https://learntubebucket.s3.amazonaws.com/test@test.com/7121cd645707ec47efa33393028473c7',
        s3Path: '/test@test.com/7121cd645707ec47efa33393028473c7',
      }, {
        userId: user._id,
        videoId: '5G229--2HJ4',
        hash: 'a868c19f55558a2a349193ff9d1f2fce',
        url: 'https://learntubebucket.s3.amazonaws.com/test@test.com/a868c19f55558a2a349193ff9d1f2fce',
        s3Path: '/test@test.com/a868c19f55558a2a349193ff9d1f2fce',
      });
    });

    Class.find({}).remove(function() {
      Class.create({
        userId: user._id,
        playlistId: 'PL2jcQseI9PWJoKqqIhOyNE9r_F4IpCf4t',
        lectures: [{
          videoId: '-SQIlNb3cWM'
        }, {
          videoId: '5G229--2HJ4'
        }]
      }, {
        userId: user._id,
        playlistId: 'PL9B61DEF63FC19BD9',
        lectures: [{
          videoId: '1ZRb1we80kM'
        }, {
          videoId: '8pin-6JrdHY'
        }, {
          videoId: 'rJnICByeL8Q'
        }]
      }, {
        userId: user._id,
        playlistId: 'PLmtapKaZsgZt3g_uAPJbsMWdkVsznn_2R',
        lectures: [{
          videoId: 'W_k2EB33s7A'
        }, {
          videoId: 'B5HkW--GAQ8'
        }]
      }, {
        userId: user._id,
        playlistId: 'PLFgquLnL59akz2EQlObY3Ac3aC68xfSU6',
        lectures: [{
          videoId: 'RgKAFK5djSk'
        }, {
          videoId: '_mVJJvx04_w'
        }]
      }, {
        userId: user._id,
        playlistId: 'PL8fVUTBmJhHJDAtZwiIOooPRurN0hna-j',
        lectures: [{
          videoId: '1ZLN9AzxVa8'
        }, {
          videoId: 'pTYyg5aDWAM'
        }]
      }, function() {
        console.log('finished seeding');
      });
    });

  });
});

