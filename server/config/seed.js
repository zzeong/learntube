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
    notes: [{
      videoId: 'sMKoNBRZM1M',
      hash: '7121cd645707ec47efa33393028473c7',
      url: 'https://learntubebucket.s3.amazonaws.com/test@test.com/7121cd645707ec47efa33393028473c7',
      s3Path: '/test@test.com/7121cd645707ec47efa33393028473c7',
    }]
  }, {
    provider: 'local',
    role: 'admin',
    name: 'Admin',
    email: 'admin@admin.com',
    password: 'admin'
  }, function(err, user) {

    Class.find({}).remove(function() {
      Class.create({
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

