/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var _ = require('lodash');
var fs = require('fs');
var csv = require('fast-csv');
var User = require('../models/user.model');
var Note = require('../models/note.model');
var Upload = require('../models/upload.model');
var WContent = require('../models/watched-content.model');
var Class = require('../models/class.model.js');
var mongoose = require('mongoose');
var aws = require('aws-sdk');
var s3 = new aws.S3();
var config = require('./environment');

mongoose.Promise = Promise;

var offsetDate = function (offset) {
  var d = new Date();
  d.setDate(d.getDate() + offset);
  return d;
};

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
  }]);
};


var seedNote = function (users) {
  var docs = [{
    userId: users[0]._id,
    videoId: 'XUEuYq64HKI',
    playlistId: 'PLuHgQVnccGMCB06JE7zFIAOJtdcZBVrap',
    type: 'editor',
    resourceType: 'text/html',
    url: 'https://learntubebucket.s3.amazonaws.com/learntubebot01@gmail.com/22760531b17c2d835740821a104f41ab',
    created: offsetDate(_.random(-8, 0)),
  }, {
    userId: users[0]._id,
    videoId: 'juzviBAjsHc',
    playlistId: 'PLuHgQVnccGMCB06JE7zFIAOJtdcZBVrap',
    type: 'file',
    resourceType: 'image/jpeg',
    url: 'https://learntubebucket.s3.amazonaws.com/learntubebot01@gmail.com/1fd76c508230960e31cfda588f6bba75',
    created: offsetDate(_.random(-8, 0)),
  }];

  return Note.create(docs);
};

var seedWatchedContent = function (users) {

  return WContent.create([{
    userId: users[0]._id,
    playlistId: 'PLtEAazd2E1Vr5ycRfR2pRQSjqFlB9uSow',
    lectures: [{
      videoId: '7BafU1p_OKo',
      completedAt: offsetDate(_.random(-8, 0)),
    }, {
      videoId: 'cuwZY0KZK3c',
      completedAt: offsetDate(_.random(-8, 0)),
    }, {
      videoId: 'iokDryA747s',
      completedAt: offsetDate(_.random(-8, 0)),
    }, {
      videoId: '8rQGMW7nt4s',
      completedAt: offsetDate(_.random(-8, 0)),
    }, {
      videoId: '7IWxw8TBPjI',
      completedAt: offsetDate(_.random(-8, 0)),
    }, {
      videoId: 'YxCkAa5rr-4',
      completedAt: offsetDate(_.random(-8, 0)),
    }, {
      videoId: 'btk_iTh55_0',
      completedAt: offsetDate(_.random(-8, 0)),
    }, {
      videoId: 'lDaTVJZ1hPI',
      completedAt: offsetDate(_.random(-8, 0)),
    }, {
      videoId: 'vzTLE5-64c8',
      completedAt: offsetDate(_.random(-8, 0)),
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
      completedAt: offsetDate(_.random(-8, 0)),
    }, {
      videoId: 'sY8qiSaAi9g',
      completedAt: offsetDate(_.random(-8, 0)),
    }, {
      videoId: 'yQaAGmHNn9s',
      completedAt: offsetDate(_.random(-8, 0)),
    }, {
      videoId: '7i1f23AVsn4',
      completedAt: offsetDate(_.random(-8, 0)),
    }, {
      videoId: 'BgtdojEoWFI',
      completedAt: offsetDate(_.random(-8, 0)),
    }, {
      videoId: 'waF2Isf-phQ',
      completedAt: offsetDate(_.random(-8, 0)),
    }, {
      videoId: 'og4Zku5VVl0',
      completedAt: offsetDate(_.random(-8, 0)),
    }, {
      videoId: 'AdQcd3sKGC8',
      completedAt: offsetDate(_.random(-8, 0)),
    }, {
      videoId: 'ZH5qZB0UucQ',
      completedAt: offsetDate(_.random(-8, 0)),
    }, {
      videoId: 'VfBr32W-hRA',
      completedAt: offsetDate(_.random(-8, 0)),
    }, {
      videoId: '5gjr15aWp24',
      completedAt: offsetDate(_.random(-8, 0)),
    }, {
      videoId: 'ebjo8_u82mI',
      completedAt: offsetDate(_.random(-8, 0)),
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
      videoId: 'XUEuYq64HKI',
      completedAt: offsetDate(_.random(-8, 0)),
    }, {
      videoId: 'N_rpDCZxRCY',
      completedAt: offsetDate(_.random(-8, 0)),
    }, {
      videoId: 'vrRS-3tyqvY',
      completedAt: offsetDate(_.random(-8, 0)),
    }, {
      videoId: 'juzviBAjsHc',
      completedAt: offsetDate(_.random(-8, 0)),
    }, {
      videoId: 'Pzi_5lGP3G4',
      completedAt: offsetDate(_.random(-8, 0)),
    }, {
      videoId: 'CUlU_DBJMvw',
      completedAt: offsetDate(_.random(-8, 0)),
    }, {
      videoId: 'yECyP1-NwsE',
      completedAt: offsetDate(_.random(-8, 0)),
    }, {
      videoId: 'UscVvA0eyaM',
      completedAt: offsetDate(_.random(-8, 0)),
    }, {
      videoId: 'Jy20JYhvapg',
      completedAt: offsetDate(_.random(-8, 0)),
    }, {
      videoId: '7hm1g_-BPvs',
      completedAt: offsetDate(_.random(-8, 0)),
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

function seedClassFromFile(path) {
  return new Promise(function (resolve, reject) {
    var bucket = [];
    var rs = fs.createReadStream(path);
    rs.pipe(csv({ headers: true }))
    .on('data', function (data) { bucket.push(data); })
    .on('end', function () {
      Class.create(bucket)
      .then(function (classes) { resolve(classes); })
      .catch(function (err) { console.log(err); reject(err); });
    });
  });
}




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
  WContent.remove({}).exec(),
  Upload.remove({}).exec(),
  Class.remove({}).exec()
])
.then(initialUser)
.then(function (users) {
  return Promise.all([
    seedNote(users),
    seedWatchedContent(users),
    seedUpload(users),
    seedClassFromFile('db/class.csv')
  ]);
})
.then(function () {
  console.log('Finish seeding');
})
.catch(function (err) {
  console.error(err.stack);
});

exports.seedClassFromFile = seedClassFromFile;
