'use strict';

require('should');
var knox  = require('knox');
var request = require('supertest-as-promised');
var mongoose = require('mongoose');
var url = require('url');
var User = require('../../models/user.model');
var Note = require('../../models/note.model');
var config = require('../../config/environment');
var app = require('../../app');
var auth = require('../../auth/auth.service');

mongoose.Promise = Promise;

var s3 = knox.createClient({
  key: config.aws.accessKeyId,
  secret: config.aws.secretKey,
  bucket: config.aws.s3Bucket
});


describe('REST API:', function () {
  var users;

  before(function (done) {
    Promise.all([
      User.remove({}),
      Note.remove({})
    ])
    .then(function () {
      var users = [{
        name: 'Fake User One',
        email: 'test1@test.com',
        password: 'password',
        provider: 'google',
        google: {
          image: {
            url: 'http://www.google.com',
          },
        }
      }, {
        name: 'Fake User Two',
        email: 'test2@test.com',
        password: 'password',
        provider: 'google',
        google: {
          image: {
            url: 'http://www.google.co.kr',
          },
        },
      }];

      return User.create(users);
    })
    .then(function (u) {
      users = u.map(function (el) { return el.toObject(); });
      users[0].token = auth.signToken(users[0]._id);
      users[1].token = auth.signToken(users[1]._id);
      done();
    })
    .catch(done);
  });

  after(function (done) {
    Promise.all([
      User.remove({}),
      Note.remove({})
    ])
    .then(done.bind(null, null), done);
  });

  describe('GET /api/notes', function () {
    before(function (done) {
      function req(user, vid) {
        return request(app)
        .post('/api/users/' + user._id + '/notes')
        .set('Authorization', 'Bearer ' + user.token)
        .field('playlistId', 'PLASDF')
        .field('videoId', vid)
        .attach('file', 'test/fixtures/dummy.html');
      }

      Promise.all([
        req(users[0], 'QWER1'),
        req(users[1], 'QWER1'),
        req(users[1], 'QWER2')
      ])
      .then(done.bind(null, null), done);
    });

    after(function (done) {
      Note.find({ userId: { $in: [users[0]._id, users[1]._id] }}).exec()
      .then(function (notes) {
        var items = notes.map(function (note) {
          return url.parse(note.url).pathname;
        });

        s3.deleteMultiple(items, function (err) {
          if (err) { return done(err); }
          done();
        });
      })
      .catch(done);
    });

    it('should return all note docs', function (done) {
      request(app)
      .get('/api/others-notes')
      .expect(200)
      .expect('Content-Type', /json/)
      .then(function (res) {
        res.body.should.length(3);
        res.body[0].userId.should.have.property('name');
        res.body[0].userId.should.have.property('google');
        res.body[0].userId.should.not.have.property('salt');
        res.body[0].userId.should.not.have.property('hashedPassword');
        res.body[0].userId.google.image.should.have.property('url');
        done();
      })
      .catch(done);
    });

    it('should return queried note docs', function (done) {
      request(app)
      .get('/api/others-notes')
      .query({ videoId: 'QWER1' })
      .expect(200)
      .expect('Content-Type', /json/)
      .then(function (res) {
        res.body.should.length(2);
        res.body[0].userId.should.not.equal(res.body[1].userId);
        done();
      })
      .catch(done);
    });

  });
});
