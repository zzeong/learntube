'use strict';

require('should');
var app = require('../../../app');
var request = require('supertest-as-promised');
var mongoose = require('mongoose');
var auth = require('../../../auth/auth.service');
var User = require('../../../models/user.model');
var Upload = require('../../../models/upload.model');

mongoose.Promise = Promise;


describe('REST API:', function () {
  var user;

  before(function (done) {
    User.remove({})
    .then(function () {
      user = new User({
        name: 'Fake User',
        email: 'test@test.com',
        password: 'password'
      });

      return user.save();
    })
    .then(function () {
      user = user.toObject();
      user.token = auth.signToken(user._id);
      done();
    })
    .catch(done);
  });

  after(function (done) {
    User.remove({})
    .then(done.bind(null, null), done);
  });

  describe('POST /api/users/:id/uploads', function () {

    beforeEach(function (done) {
      Upload.remove({})
      .then(done.bind(null, null), done);
    });

    afterEach(function (done) {
      Upload.remove({})
      .then(done.bind(null, null), done);
    });

    it('should return created \'upload model doc\'', function (done) {
      request(app)
      .post('/api/users/' + user._id + '/uploads')
      .set('Authorization', 'Bearer ' + user.token)
      .send({
        videoId: 'ASDF',
        playlistId: 'QWER',
        url: 'http://foo.com',
        fileName: 'foo.txt',
      })
      .expect(201)
      .expect('Content-Type', /json/)
      .then(function (res) {
        res.body.should.have.property('_id');
        res.body.should.have.property('userId');
        res.body.should.have.property('playlistId');
        res.body.should.have.property('lectures');
        res.body.lectures.should.have.length(1);

        return Upload.find({}).exec();
      })
      .then(function (uploads) {
        uploads.should.have.length(1);
        done();
      })
      .catch(done);
    });

    it('should return \'upload model doc\' where lecture was pushed in', function (done) {
      var upload = new Upload({
        userId: user._id,
        playlistId: 'PL34d',
        lectures: [{
          videoId: 'ASDF',
          playlistId: 'QWER',
          url: 'http://foo.com',
          fileName: 'foo.txt',
        }]
      });

      upload.save()
      .then(function () {
        return request(app)
        .post('/api/users/' + user._id + '/uploads')
        .set('Authorization', 'Bearer ' + user.token)
        .send({
          videoId: 'ASDF2',
          playlistId: 'PL34d',
          url: 'http://fooo.com',
          fileName: 'foo2.txt',
        })
        .expect(201)
        .expect('Content-Type', /json/);
      })
      .then(function (res) {
        res.body.should.have.property('_id');
        res.body.should.have.property('userId');
        res.body.should.have.property('playlistId');
        res.body.should.have.property('lectures');
        res.body.lectures.should.have.length(2);

        return Upload.find({}).exec();
      })
      .then(function (uploads) {
        uploads.should.have.length(1);
        done();
      })
      .catch(done);
    });
  });


  describe('GET /api/users/:id/uploads', function () {

    beforeEach(function (done) {
      Upload.remove({})
      .then(function () {
        return request(app)
        .post('/api/users/' + user._id + '/uploads')
        .set('Authorization', 'Bearer ' + user.token)
        .send({
          videoId: 'ASDF',
          playlistId: 'QWER',
          url: 'http://foo.com'
        })
        .expect(201)
        .expect('Content-Type', /json/);
      })
      .then(done.bind(null, null), done);
    });

    afterEach(function (done) {
      Upload.remove({})
      .then(done.bind(null, null), done);
    });

    it('should return uploads when query with playlistId', function (done) {
      request(app)
      .get('/api/users/' + user._id + '/uploads')
      .set('Authorization', 'Bearer ' + user.token)
      .query({ playlistId: 'QWER' })
      .expect(200)
      .expect('Content-Type', /json/)
      .then(function (res) {
        res.body.should.have.instanceof(Array);
        res.body.should.have.length(1);
        res.body[0].should.have.property('_id');
        res.body[0].should.have.property('userId');
        res.body[0].should.have.property('playlistId');
        res.body[0].should.have.property('lectures');
        res.body[0].lectures.should.have.length(1);
        done();
      })
      .catch(done);
    });

    it('should return uploads with no query', function (done) {
      request(app)
      .get('/api/users/' + user._id + '/uploads')
      .set('Authorization', 'Bearer ' + user.token)
      .expect(200)
      .expect('Content-Type', /json/)
      .then(function (res) {
        res.body.should.have.instanceof(Array);
        res.body.should.have.length(1);
        res.body[0].should.have.property('_id');
        res.body[0].should.have.property('userId');
        res.body[0].should.have.property('playlistId');
        res.body[0].should.have.property('lectures');
        res.body[0].lectures.should.have.length(1);
        done();
      })
      .catch(done);
    });
  });
});

