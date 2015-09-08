'use strict';

var _ = require('lodash');
var should = require('should');
var request = require('supertest');
var User = require('../user/user.model');
var Note = require('../user/note/note.model');
var app = require('../../app');


describe('REST API:', function() {
  var user1, user2;
  this.timeout(5000);

  before(function(done) {
    User.remove().exec(); 
    User.create({
      name: 'Fake User One',
      email: 'test@test.com',
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
    var params = {
      playlistId: 'asdf',
      contents: '<h1>HOORAY</h1>'
    };

    before(function(done) {
      request(app)
      .post('/api/users/' + user1._id + '/notes')
      .send(_.assign({ videoId: 'QWER1'}, params))
      .end(function(err, res) {
        if(err) { return done(err); } 

        request(app)
        .post('/api/users/' + user2._id + '/notes')
        .send(_.assign({ videoId: 'QWER1'}, params))
        .end(function(err, res) {
          if(err) { return done(err); }

          request(app)
          .post('/api/users/' + user2._id + '/notes')
          .send(_.assign({ videoId: 'QWER2'}, params))
          .end(function(err, res) {
            if(err) { return done(err); } 
            done();
          });

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
