'use strict';

var should = require('should');
var app = require('../../../app');
var request = require('supertest');
var mongoose = require('mongoose');
var User = require('../user.model');
var Upload = require('./upload.model');

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

  describe('POST /api/users/:id/uploads', function() {

    beforeEach(function(done) {
      Upload.remove().exec().then(function() {
        done();
      });
    });

    afterEach(function(done) {
      Upload.remove().exec().then(function() {
        done(); 
      });
    });

    it('should return created \'upload model doc\'', function(done) {
      request(app)
      .post('/api/users/' + user._id + '/uploads')
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

        Upload.find({}, function(err, uploads) {
          uploads.should.have.length(1);
          done();
        });
      });
    });

    it('should return \'upload model doc\' where lecture was pushed in', function(done) {
      var upload = new Upload({
        userId: user._id,
        playlistId: 'PL34d',
        lectures: [{
          videoId: 'ASDF',
          playlistId: 'QWER',
          url: 'http://foo.com'
        }]
      });

      upload.save(function(err) {
        if(err) { return done(err); }

        request(app)
        .post('/api/users/' + user._id + '/uploads')
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

          Upload.find({}, function(err, uploads) {
            uploads.should.have.length(1);
            done();
          });
        });

      });

    });
  });


  describe('GET /api/users/:id/uploads', function() {

    beforeEach(function(done) {
      Upload.remove().exec().then(function() {
        request(app)
        .post('/api/users/' + user._id + '/uploads')
        .send({
          videoId: 'ASDF',
          playlistId: 'QWER',
          url: 'http://foo.com'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) { return done(err); } 
          done();
        });
      });
    }); 

    afterEach(function(done) {
      Upload.remove().exec().then(function() {
        done(); 
      });
    });

    it('should return uploads when query with playlistId', function(done) {
      request(app)
      .get('/api/users/' + user._id + '/uploads')
      .query({ playlistId: 'QWER' })
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if(err) { return done(err); } 
        res.body.should.have.instanceof(Array);
        res.body.should.have.length(1);
        res.body[0].should.have.property('_id');
        res.body[0].should.have.property('userId');
        res.body[0].should.have.property('playlistId');
        res.body[0].should.have.property('lectures');
        res.body[0].lectures.should.have.length(1);
        done();
      });
    });

    it('should return uploads with no query', function(done) {
      request(app)
      .get('/api/users/' + user._id + '/uploads')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if(err) { return done(err); } 
        res.body.should.have.instanceof(Array);
        res.body.should.have.length(1);
        res.body[0].should.have.property('_id');
        res.body[0].should.have.property('userId');
        res.body[0].should.have.property('playlistId');
        res.body[0].should.have.property('lectures');
        res.body[0].lectures.should.have.length(1);
        done();
      });
    });
  });

});

