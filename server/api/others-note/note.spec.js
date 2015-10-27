'use strict';

require('should');
var knox  = require('knox');
var request = require('supertest');
var mongoose = require('mongoose');
var url = require('url');
var User = require('../../models/user.model');
var Note = require('../../models/note.model');
var config = require('../../config/environment');
var app = require('../../app');
var auth = require('../../auth/auth.service');

var Promise = mongoose.Promise = require('promise');

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
    .catch(function (err) { done(err); });
  });

  after(function (done) {
    Promise.all([
      User.remove({}),
      Note.remove({})
    ])
    .then(function () { done(); })
    .catch(function (err) { done(err); });
  });

  describe('GET /api/notes', function () {
    before(function (done) {
      request(app)
      .post('/api/users/' + users[0]._id + '/notes')
      .set('Authorization', 'Bearer ' + users[0].token)
      .field('playlistId', 'PLASDF')
      .field('videoId', 'QWER1')
      .attach('file', 'test/fixtures/dummy.html')
      .end(function (err) {
        if (err) { return done(err); }

        request(app)
        .post('/api/users/' + users[1]._id + '/notes')
        .set('Authorization', 'Bearer ' + users[1].token)
        .field('playlistId', 'PLASDF')
        .field('videoId', 'QWER1')
        .attach('file', 'test/fixtures/dummy.html')
        .end(function (err) {
          if (err) { return done(err); }

          request(app)
          .post('/api/users/' + users[1]._id + '/notes')
          .set('Authorization', 'Bearer ' + users[1].token)
          .field('playlistId', 'PLASDF')
          .field('videoId', 'QWER2')
          .attach('file', 'test/fixtures/dummy.html')
          .end(function (err) {
            if (err) { return done(err); }
            done();
          });

        });
      });
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
      .catch(function (err) { done(err); });
    });

    it('should return all note docs', function (done) {
      request(app)
      .get('/api/others-notes')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) { return done(err); }
        res.body.should.length(3);
        res.body[0].userId.should.have.property('name');
        res.body[0].userId.should.have.property('google');
        res.body[0].userId.should.not.have.property('salt');
        res.body[0].userId.should.not.have.property('hashedPassword');
        res.body[0].userId.google.image.should.have.property('url');
        done();
      });
    });

    it('should return queried note docs', function (done) {
      request(app)
      .get('/api/others-notes')
      .query({ videoId: 'QWER1' })
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) { return done(err); }
        res.body.should.length(2);
        res.body[0].userId.should.not.equal(res.body[1].userId);
        done();
      });
    });

  });
});
