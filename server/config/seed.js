/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var User = require('../api/user/user.model');
var Note = require('../api/user/note/note.model');
var Upload = require('../api/user/upload/upload.model');
var Class = require('../api/user/class/class.model');
var Rating = require('../api/rating/rating.model');
var mongoose = require('mongoose');
var Promise = mongoose.Promise = require('promise');


var initialUser = function() {
  return User.create([{
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
  }]);
};

var seedNote = function(user) {
  return Note.create({
    userId: user._id,
    videoId: '1ZRb1we80kM',
    playlistId: 'PL9B61DEF63FC19BD9',
    url: 'https://learntubebucket.s3.amazonaws.com/test@test.com/7121cd645707ec47efa33393028473c7',
    type: 'editor',
    resourceType: 'text/html',
  }, {
    userId: user._id,
    videoId: 'rJnICByeL8Q',
    playlistId: 'PL9B61DEF63FC19BD9',
    url: 'https://learntubebucket.s3.amazonaws.com/test@test.com/a868c19f55558a2a349193ff9d1f2fce',
    type: 'editor',
    resourceType: 'text/html',
  });
};

var seedClass = function(user) {
  return Class.create([{
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
  }]);
};

var seedRating = function() {
  return Rating.create([{
    playlistId: 'PLdN7Dwi6JGXsAASQgnsm34BBL6mQfQUKK',
    points: 99
  }, {
    playlistId: 'PLyRIdnMFwruhaDX0FGe8od4VU20CD3dTC',
    points: 61
  }, {
    playlistId: 'PLaNNx1k0ao1v8I2C8DAxXOayC3dG00xtj',
    points: 71
  }, {
    playlistId: 'PLJAq9GpGx5BMdIUSwg53JX7LiuYW_EYvP',
    points: 82
  }, {
    playlistId: 'PLcpoB2VESJmekv4lb3uZkMc5k7fyMSIzU',
    points: 4
  }, {
    playlistId: 'PLl4T6p7km9da1BKEAGzloOQqDVw3ZB7SF',
    points: 68
  }, {
    playlistId: 'PL6DB5987C212AC19F',
    points: 8
  }, {
    playlistId: 'PLFVCbA-bmHb8_v54a9JNkNgZELYslC5wF',
    points: 38
  }]);
};




/* Note Test URL:
 * http://localhost:9000/class/PL9B61DEF63FC19BD9/lecture/1ZRb1we80kM
 * http://localhost:9000/class/PL9B61DEF63FC19BD9/lecture/rJnICByeL8Q
 */
Promise.all([
  User.remove({}).exec(),
  Note.remove({}).exec(),
  Class.remove({}).exec(),
  Rating.remove({}).exec(),
  Upload.remove({}).exec()
])
.then(initialUser)
.then(function(users) {
  return Promise.all([
    seedNote(users[0]),
    seedClass(users[0]),
    seedRating()
  ]);
})
.then(function() {
  console.log('Finish seeing');
})
.catch(function(err) {
  console.error(err); 
});
