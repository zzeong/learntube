'use strick';

var should = require('should');
var app = require('../../../app');
var request = require('supertest');
var mongoose = require('mongoose');
var User = require('../user.model');
var Uploaded = require('./uploaded.model');

describe('REST API:', function() {
  var user;

  before(function(done) {
    User.remove().exec().then(function() {
      user = new User({
        name: 'Fake User',
        email: 'test@test.com',
        password: 'password'
      });

      user.save(function() {
        done();
      });
    });
  });

  after(function(done) {
    User.remove().exec().then(function() {
      done(); 
    });
  });

  describe('POST /api/users/:id/uploaded', function() {

    beforeEach(function(done) {
      Uploaded.remove().exec().then(function() {
        done();
      });
    });

    afterEach(function(done) {
      Uploaded.remove().exec().then(function() {
        done(); 
      });
    });

    it('should return created \'uploaded model doc\'', function(done) {
      request(app)
      .post('/api/users/' + user._id + '/uploaded')
      .send({
        videoId: 'ASDF',
        playlistId: 'QWER',
        url: 'http://foo.com'
      })
      .expect(201)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if(err) { return done(err); } 
        res.body.should.have.property('_id');
        res.body.should.have.property('userId');
        res.body.should.have.property('playlistId');
        res.body.should.have.property('lectures');
        res.body.lectures.should.have.length(1);

        Uploaded.find({}, function(err, uploadedContents) {
          uploadedContents.should.have.length(1);
          done();
        });
      });
    });

    it('should return \'uploaded model doc\' where lecture was pushed in', function(done) {
      var uploaded = new Uploaded({
        userId: user._id,
        playlistId: 'PL34d',
        lectures: [{
          videoId: 'ASDF',
          playlistId: 'QWER',
          url: 'http://foo.com'
        }]
      });

      uploaded.save(function(err) {
        if(err) { return done(err); }

        request(app)
        .post('/api/users/' + user._id + '/uploaded')
        .send({
          videoId: 'ASDF2',
          playlistId: 'PL34d',
          url: 'http://fooo.com'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) { return done(err); } 
          res.body.should.have.property('_id');
          res.body.should.have.property('userId');
          res.body.should.have.property('playlistId');
          res.body.should.have.property('lectures');
          res.body.lectures.should.have.length(2);

          Uploaded.find({}, function(err, uploadedContents) {
            uploadedContents.should.have.length(1);
            done();
          });
        });

      });

    });
  });

});

