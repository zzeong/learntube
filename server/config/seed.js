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
var aws = require('aws-sdk');
var s3 = new aws.S3();
var config = require('./environment');


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
  }, {
    provider: 'google',
    role: 'user',
    name: 'Jieun Lee',
    email: 'learntubebot01@gmail.com'
  }, {
    provider: 'google',
    role: 'user',
    name: 'Seyfried Amanda',
    email: 'learntubebot02@gmail.com'
  }]);
};

var seedNote = function(users) {
  var bot = {
    'learntubebot01@gmail.com': {
      hash: [
        'ac67da4d3c844e72f0607b0ef4aff541',
        'eb42fc364af000dd9af888532ce63226',
        '4fa0e346807233f7f4c18cb6c35afec1',
        'fe8cf8d21a24376a1263b2267a77c87a'
      ]
    }, 
    'learntubebot02@gmail.com': {
      hash: [
        '2fb8aad5086a0a6fe9967829017fb4c2',
        'a37fa88288dc8e2acfb9d69715131e01',
        '5295158d2070c6d600521c5667dd63b8',
        '4c757fe906a459a8283c830d67466358'
      ]
    }, 
  };

  var createDoc = function(user, i) {
    var id = {
      playlist: 'PL9B61DEF63FC19BD9',
      video: ['1ZRb1we80kM', 'rJnICByeL8Q']
    };

    return {
      userId: user._id,
      videoId: id.video[parseInt(i / 2)],
      playlistId: id.playlist,
      url : 'https://learntubebucket.s3.amazonaws.com/' + user.email + '/' + bot[user.email].hash[i],
      type: 'editor',
      resourceType: 'text/html',
    }; 
  };

  var docs = [{
    userId: users[0]._id,
    videoId: '1ZRb1we80kM',
    playlistId: 'PL9B61DEF63FC19BD9',
    url: 'https://learntubebucket.s3.amazonaws.com/' + users[0].email + '/7121cd645707ec47efa33393028473c7',
    type: 'editor',
    resourceType: 'text/html',
  }, {
    userId: users[0]._id,
    videoId: 'rJnICByeL8Q',
    playlistId: 'PL9B61DEF63FC19BD9',
    url: 'https://learntubebucket.s3.amazonaws.com/' + users[0].email + '/a868c19f55558a2a349193ff9d1f2fce',
    type: 'editor',
    resourceType: 'text/html',
  }]; 
  
  for(var i = 0; i < 4; i++) {
    docs.push(createDoc(users[2], i));
    docs.push(createDoc(users[3], i));
  }

  return Note.create(docs);
};

var seedClass = function(users) {
  return Class.create([{
    userId: users[3]._id,
    playlistId: 'PLeNYl43VgxfUsY23CygyCtE1MKw8Vy4e8',
    lectures: [{
      videoId: 'RKhsHGfrFmY'
    }, {
      videoId: 'rJnICByeL8Q'
    }]
  }, {
    userId: users[3]._id,
    playlistId: 'PL9B61DEF63FC19BD9',
    lectures: [{
      videoId: '1ZRb1we80kM'
    }, {
      videoId: '8pin-6JrdHY'
    }, {
      videoId: 'rJnICByeL8Q'
    }]
  }, {
    userId: users[3]._id,
    playlistId: 'PLmtapKaZsgZt3g_uAPJbsMWdkVsznn_2R',
    lectures: [{
      videoId: 'W_k2EB33s7A'
    }, {
      videoId: 'B5HkW--GAQ8'
    }]
  }, {
    userId: users[3]._id,
    playlistId: 'PLFgquLnL59akz2EQlObY3Ac3aC68xfSU6',
    lectures: [{
      videoId: 'RgKAFK5djSk'
    }, {
      videoId: '_mVJJvx04_w'
    }]
  }, {
    userId: users[3]._id,
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

var seedUpload = function(users) {
  var hashes = [
   '2bd6387e8333e63dec3e1cea9617accb',  
   '24ebf6590e230c823d1afd1dd01911e2'
  ];

  return Upload.create([{
    userId: users[2]._id,
    playlistId: 'PLReOOCELOIi93J42_bOw_Fe-zMpLxKUMx',
    lectures: [{
      videoId: 'miUYEpXDitc',
      fileName: 'just.txt',
      url: s3.endpoint.href + config.aws.s3Bucket + '/' + users[2].email + '/uploads/' + hashes[0],
    }, {
      videoId: 'F-xd3G0PW0k',
      fileName: 'just.pdf',
      url: s3.endpoint.href + config.aws.s3Bucket + '/' + users[2].email + '/uploads/' + hashes[1],
    }],
  }]);
};




/**
 * Note Test URL:
 * http://localhost:9000/class/PL9B61DEF63FC19BD9/lecture/1ZRb1we80kM
 * http://localhost:9000/class/PL9B61DEF63FC19BD9/lecture/rJnICByeL8Q
 *
 * Upload Test URL:
 * http://localhost:9000/class/PLReOOCELOIi93J42_bOw_Fe-zMpLxKUMx/lecture/miUYEpXDitc
 * http://localhost:9000/class/PLReOOCELOIi93J42_bOw_Fe-zMpLxKUMx/lecture/F-xd3G0PW0k
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
    seedNote(users),
    seedClass(users),
    seedUpload(users),
    seedRating()
  ]);
})
.then(function() {
  console.log('Finish seeding');
})
.catch(function(err) {
  console.error(err); 
});
