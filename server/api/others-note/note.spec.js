'use strict';

var _ = require('lodash');
var should = require('should');
var knox  = require('knox');
var request = require('supertest');
var url = require('url');
var User = require('../user/user.model');
var Note = require('../user/note/note.model');
var config = require('../../config/environment');
var app = require('../../app');

var s3 = knox.createClient({
  key: config.aws.accessKeyId,
  secret: config.aws.secretKey,
  bucket: config.aws.s3Bucket
});


describe('REST API:', function() {
  var user1, user2;
  this.timeout(5000);

  before(function(done) {
    User.remove().exec(); 
    User.create({
      name: 'Fake User One',
      email: 'test1@test.com',
      password: 'password',
      provider: 'google',
      google: {
        image: {
          url: 'http://www.google.com', 
        }, 
      },
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
    }, function(err, u1, u2) {
      user1 = u1;
      user2 = u2;

      Note.remove().exec();
      done();
    });
  });

  after(function() {
    User.remove().exec(); 
    Note.remove().exec(); 
  });

  describe('GET /api/notes', function() {
    this.timeout(15000);
    var params = {
      playlistId: 'asdf',
    };

    before(function(done) {
      request(app)
      .post('/api/users/' + user1._id + '/notes')
      .field('playlistId', 'PLASDF')
      .field('videoId', 'QWER1')
      .attach('file', 'test/fixtures/dummy.html')
      .end(function(err, res) {
        if(err) { return done(err); } 

        request(app)
        .post('/api/users/' + user2._id + '/notes')
        .field('playlistId', 'PLASDF')
        .field('videoId', 'QWER1')
        .attach('file', 'test/fixtures/dummy.html')
        .end(function(err, res) {
          if(err) { return done(err); }

          request(app)
          .post('/api/users/' + user2._id + '/notes')
          .field('playlistId', 'PLASDF')
          .field('videoId', 'QWER2')
          .attach('file', 'test/fixtures/dummy.html')
          .end(function(err, res) {
            if(err) { return done(err); } 
            done();
          });

        });
      });
    });

    after(function(done) {
      Note.find({ $or: [{ userId: user1._id }, { userId: user2._id }] }, function(err, notes) {
        var items = notes.map(function(note) { return url.parse(note.url).pathname; });

        s3.deleteMultiple(items, function(error, response) {
          if(error) { return done(error); }
          done();
        });
      });
    });

    it('should return all note docs', function(done) {
      request(app)
      .get('/api/others-notes')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if(err) { return done(err); } 
        res.body.should.length(3);
        res.body[0].userId.should.have.property('name');
        res.body[0].userId.should.have.property('google');
        res.body[0].userId.should.not.have.property('salt');
        res.body[0].userId.should.not.have.property('hashedPassword');
        res.body[0].userId.google.image.should.have.property('url');
        done();
      });
    });

    it('should return queried note docs', function(done) {
      request(app)
      .get('/api/others-notes')
      .query({ videoId: 'QWER1' })
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if(err) { return done(err); } 
        res.body.should.length(2);
        res.body[0].userId.should.not.equal(res.body[1].userId);
        done();
      });
    });

  });
});
