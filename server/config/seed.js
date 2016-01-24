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
var Handout = require('../models/handout.model');
var WatCtt = require('../models/watched-content.model');
var Class = require('../models/class.model.js');
var mongoose = require('mongoose');

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
    url: 'https://knowbridge-dev.s3.amazonaws.com/learntubebot01@gmail.com/notes/22760531b17c2d835740821a104f41ab',
    created: offsetDate(_.random(-8, 0)),
  }, {
    userId: users[0]._id,
    videoId: 'juzviBAjsHc',
    playlistId: 'PLuHgQVnccGMCB06JE7zFIAOJtdcZBVrap',
    type: 'file',
    resourceType: 'image/jpeg',
    url: 'https://knowbridge-dev.s3.amazonaws.com/learntubebot01@gmail.com/notes/1fd76c508230960e31cfda588f6bba75',
    created: offsetDate(_.random(-8, 0)),
  }];

  return Note.create(docs);
};

var seedWatchedContent = function (users, classes) {
  return WatCtt.create([{
    _watcher: users[0]._id,
    _class: classes[0]._id,
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
    _watcher: users[0]._id,
    _class: classes[1]._id,
    lectures: [{
      videoId: 'ZQZtCVkypAo'
    }, {
      videoId: '5z_d0soK1cI'
    }]
  }, {
    _watcher: users[0]._id,
    _class: classes[2]._id,
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
    _watcher: users[0]._id,
    _class: classes[3]._id,
    lectures: [{
      videoId: 'YuC__aN-v04'
    }, {
      videoId: 'V38uZEimeck'
    }]
  }, {
    _watcher: users[0]._id,
    _class: classes[4]._id,
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
    _watcher: users[0]._id,
    _class: classes[5]._id,
    lectures: [{
      videoId: 'uLhvu0IanPE'
    }, {
      videoId: 'oRw5onieJ3o'
    }]
  }]);
};

var seedHandout = function (users) {
  return Handout.create([{
    _uploader: users[1]._id,
    playlistId: 'PLtEAazd2E1Vr5ycRfR2pRQSjqFlB9uSow',
    videoId: '7BafU1p_OKo',
    fileName: 'handout.pdf',
    s3Path: `/${users[1].email}/handouts/just.pdf`,
  }, {
    _uploader: users[1]._id,
    playlistId: 'PLtEAazd2E1Vr5ycRfR2pRQSjqFlB9uSow',
    videoId: 'iokDryA747s',
    fileName: 'handout.txt',
    s3Path: `/${users[1].email}/handouts/just.txt`,
  }, {
    _uploader: users[1]._id,
    playlistId: 'PLtEAazd2E1Vr5ycRfR2pRQSjqFlB9uSow',
    videoId: 'btk_iTh55_0',
    fileName: 'handout.png',
    s3Path: `/${users[1].email}/handouts/just.png`,
  }]);
};

function seedClassFromFile(path) {
  return new Promise((resolve, reject) => {
    let bucket = [];
    let rs = fs.createReadStream(path);
    rs.pipe(csv({ headers: true }))
    .on('data', (data) => bucket.push(data))
    .on('end', () => {
      Class.create(bucket)
      .then(() => {
        let docs = [
          'PLtEAazd2E1Vr5ycRfR2pRQSjqFlB9uSow',
          'PLXYHQ27KYu7VmsPc5BUN2UBJn1MyYLpsw',
          'PL46F0A159EC02DF82',
          'PLuHgQVnccGMA0lO0qip6Phh6UL73TS0es',
          'PLuHgQVnccGMCB06JE7zFIAOJtdcZBVrap',
          'PLVIfzJWJwLxl2BEs-lJmngN70L_NJmgZy'
        ]
        .map((id) => {
          return {
            playlistId: id,
            categorySlug: 'BUFA',
            channelId: 'UCvlN-EjFtYgVEe3m1qKOmIQ',
            rate: _.random(0, 5),
            views: _.random(10, 1000)
          };
        });

        return Class.create(docs);
      })
      .then(resolve)
      .catch((err) => {
        console.log(err);
        reject(err);
      });
    });
  });
}

Promise.all([
  User.remove({}).exec(),
  Note.remove({}).exec(),
  WatCtt.remove({}).exec(),
  Handout.remove({}).exec(),
  Class.remove({}).exec()
])
.then(initialUser)
.then((users) => {
  return seedClassFromFile('db/class.csv')
  .then((classes) => Promise.all([
    seedNote(users),
    seedWatchedContent(users, classes),
    seedHandout(users),
  ]));
})
.then(() => console.log('Finish seeding'))
.catch((err) => console.error(err.stack));

exports.seedClassFromFile = seedClassFromFile;
