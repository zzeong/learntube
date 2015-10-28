/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var _ = require('lodash');
var User = require('../models/user.model');
var Note = require('../models/note.model');
var Upload = require('../models/upload.model');
var Class = require('../models/class.model');
var Rating = require('../models/rating.model');
var mongoose = require('mongoose');
var Promise = mongoose.Promise = require('promise');
var aws = require('aws-sdk');
var s3 = new aws.S3();
var config = require('./environment');


var initialUser = function () {
  return User.create([{
    provider: 'google',
    role: 'user',
    name: 'Jieun Lee',
    email: 'learntubebot01@gmail.com'
  }, {
    provider: 'google',
    role: 'user',
    name: 'Seyfried Amanda',
    email: 'learntubebot02@gmail.com'
  }, {
    provider: 'google',
    role: 'user',
    name: 'zzeong team',
    email: 'learntubebot03@gmail.com'
  }, {
    provider: 'google',
    role: 'user',
    name: 'Jinyoung Kim',
    email: 'ligeek49@gmail.com'
  }]);
};

var seedNote = function (users) {
  var bot = {
    'learntubebot01@gmail.com': {
      hash: [
        '2af6cbcc930fec1a4358b8ac63c1d26c',
        '48c994f54ee679e3715f63c1f615393b'
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
    'learntubebot03@gmail.com': {
      hash: [
        '826b6745d1ce6b449eba72077a99a6f6'
      ]
    },
    'ligeek49@gmail.com': {
      hash: [
        'c3126d2c3dca4dcd0c8017aa70d61280'
      ]
    },
  };

  var id = {
    playlist: 'PLtEAazd2E1Vr5ycRfR2pRQSjqFlB9uSow',
    video: ['7BafU1p_OKo', '7IWxw8TBPjI', '8rQGMW7nt4s']
  };

  var docs = [{
    userId: users[0]._id,
    videoId: id.video[1],
    playlistId: id.playlist,
    url: 'https://learntubebucket.s3.amazonaws.com/' + users[0].email + '/' + bot[users[0].email].hash[0],
    type: 'editor',
    resourceType: 'text/html',
  }, {
    userId: users[0]._id,
    videoId: id.video[2],
    playlistId: id.playlist,
    url: 'https://learntubebucket.s3.amazonaws.com/' + users[0].email + '/' + bot[users[0].email].hash[1],
    type: 'editor',
    resourceType: 'text/html',
  }, {
    userId: users[2]._id,
    videoId: id.video[0],
    playlistId: id.playlist,
    url: 'https://learntubebucket.s3.amazonaws.com/' + users[2].email + '/' + bot[users[2].email].hash[0],
    type: 'file',
    resourceType: 'image/jpeg',
  }, {
    userId: users[3]._id,
    videoId: id.video[0],
    playlistId: id.playlist,
    url: 'https://learntubebucket.s3.amazonaws.com/' + users[3].email + '/' + bot[users[3].email].hash[0],
    type: 'editor',
    resourceType: 'text/html',
  }];

  return Note.create(docs);
};

var seedClass = function (users) {
  var timeMachine = function (offset) {
    var d = new Date();
    d.setDate(d.getDate() + offset);
    return d;
  };

  return Class.create([{
    userId: users[0]._id,
    playlistId: 'PLtEAazd2E1Vr5ycRfR2pRQSjqFlB9uSow',
    lectures: [{
      videoId: '7BafU1p_OKo',
      completedAt: timeMachine(_.random(-7, 0)),
    }, {
      videoId: 'cuwZY0KZK3c',
      completedAt: timeMachine(_.random(-7, 0)),
    }, {
      videoId: 'iokDryA747s',
      completedAt: timeMachine(_.random(-7, 0)),
    }, {
      videoId: '8rQGMW7nt4s',
      completedAt: timeMachine(_.random(-7, 0)),
    }, {
      videoId: '7IWxw8TBPjI',
      completedAt: timeMachine(_.random(-7, 0)),
    }, {
      videoId: 'YxCkAa5rr-4',
      completedAt: timeMachine(_.random(-7, 0)),
    }, {
      videoId: 'btk_iTh55_0',
      completedAt: timeMachine(_.random(-7, 0)),
    }, {
      videoId: 'lDaTVJZ1hPI',
      completedAt: timeMachine(_.random(-7, 0)),
    }, {
      videoId: 'vzTLE5-64c8',
      completedAt: timeMachine(_.random(-7, 0)),
    }]
  }, {
    userId: users[0]._id,
    playlistId: 'PLXYHQ27KYu7VmsPc5BUN2UBJn1MyYLpsw',
    lectures: [{
      videoId: 'ZQZtCVkypAo'
    }, {
      videoId: '5z_d0soK1cI'
    }]
  }, {
    userId: users[0]._id,
    playlistId: 'PL46F0A159EC02DF82',
    lectures: [{
      videoId: 'yUyJ1gcaraM',
      completedAt: timeMachine(_.random(-14, 0)),
    }, {
      videoId: 'sY8qiSaAi9g',
      completedAt: timeMachine(_.random(-14, 0)),
    }, {
      videoId: 'yQaAGmHNn9s',
      completedAt: timeMachine(_.random(-14, 0)),
    }, {
      videoId: '7i1f23AVsn4',
      completedAt: timeMachine(_.random(-14, 0)),
    }, {
      videoId: 'BgtdojEoWFI',
      completedAt: timeMachine(_.random(-14, 0)),
    }, {
      videoId: 'waF2Isf-phQ',
      completedAt: timeMachine(_.random(-14, 0)),
    }, {
      videoId: 'og4Zku5VVl0',
      completedAt: timeMachine(_.random(-14, 0)),
    }, {
      videoId: 'AdQcd3sKGC8',
      completedAt: timeMachine(_.random(-14, 0)),
    }, {
      videoId: 'ZH5qZB0UucQ',
      completedAt: timeMachine(_.random(-14, 0)),
    }, {
      videoId: 'VfBr32W-hRA',
      completedAt: timeMachine(_.random(-14, 0)),
    }, {
      videoId: '5gjr15aWp24',
      completedAt: timeMachine(_.random(-14, 0)),
    }, {
      videoId: 'ebjo8_u82mI',
      completedAt: timeMachine(_.random(-14, 0)),
    }]
  }, {
    userId: users[0]._id,
    playlistId: 'PLuHgQVnccGMA0lO0qip6Phh6UL73TS0es',
    lectures: [{
      videoId: 'YuC__aN-v04'
    }, {
      videoId: 'V38uZEimeck'
    }]
  }, {
    userId: users[0]._id,
    playlistId: 'PLuHgQVnccGMCB06JE7zFIAOJtdcZBVrap',
    lectures: [{
      videoId: 'XUEuYq64HKI'
    }, {
      videoId: 'N_rpDCZxRCY'
    }]
  }, {
    userId: users[0]._id,
    playlistId: 'PLVIfzJWJwLxl2BEs-lJmngN70L_NJmgZy',
    lectures: [{
      videoId: 'uLhvu0IanPE'
    }, {
      videoId: 'oRw5onieJ3o'
    }]
  }]);
};

var seedRating = function () {
  return Rating.create([{
    playlistId: 'PLuHgQVnccGMA4uSig3hCjl7wTDeyIeZVU',
    points: 99
  }, {
    playlistId: 'PLvtbuRelN29hTIX2NyTxnPkEays6u95Qe',
    points: 82
  }, {
    playlistId: 'PLaNNx1k0ao1v8I2C8DAxXOayC3dG00xtj',
    points: 71
  }, {
    playlistId: 'PLJAq9GpGx5BMdIUSwg53JX7LiuYW_EYvP',
    points: 61
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
    playlistId: 'PLzX7CTd7CtHl5RQ9fxx_daq9WbVRW8a2z',
    points: 38
  }]);
};

var seedUpload = function (users) {
  var hashes = [
   'd3e6cfa0eb57bab5c50a88a049b42930',
   '8af01a82ad2ce86d8d0e16fbc40b069b'
  ];

  return Upload.create([{
    userId: users[1]._id,
    playlistId: 'PLtEAazd2E1Vr5ycRfR2pRQSjqFlB9uSow',
    lectures: [{
      videoId: '7BafU1p_OKo',
      fileName: 'handout.pdf',
      url: s3.endpoint.href + config.aws.s3Bucket + '/' + users[1].email + '/uploads/' + hashes[0],
    }, {
      videoId: '8rQGMW7nt4s',
      fileName: 'handout.pdf',
      url: s3.endpoint.href + config.aws.s3Bucket + '/' + users[1].email + '/uploads/' + hashes[1],
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
.then(function (users) {
  return Promise.all([
    seedNote(users),
    seedClass(users),
    seedUpload(users),
    seedRating()
  ]);
})
.then(function () {
  console.log('Finish seeding');
})
.catch(function (err) {
  console.error(err.stack);
});
