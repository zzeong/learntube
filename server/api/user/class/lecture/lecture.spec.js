'use strict';

require('should');
var app = require('../../../../app');
var request = require('supertest-as-promised');
var Promise = require('promise');
var auth = require('../../../../auth/auth.service.js');
var Class = require('../../../../models/class.model');
var User = require('../../../../models/user.model');

require('mongoose').Promise = Promise;

describe('REST API:', function () {
  var user;

  before(function (done) {
    Promise.all([
      User.remove({}),
      Class.remove({})
    ])
    .then(function () {
      user = new User({
        name: 'Fake User',
        email: 'test@test.com',
        password: 'password',
      });
      return user.save();
    })
    .then(function (u) {
      user = u.toObject();
      user.token = auth.signToken(user._id);
      done();
    })
    .catch(done);
  });

  after(function (done) {
    Promise.all([
      User.remove({}),
      Class.remove({})
    ])
    .then(done.bind(null, null), done);
  });

  describe('POST /api/users/:id/classes/:cid/lectures/', function () {
    var classe;

    beforeEach(function (done) {
      classe = new Class({
        playlistId: 'SNSD',
        userId: user._id
      });
      classe.save()
      .then(done.bind(null, null), done);
    });

    afterEach(function (done) {
      Class.remove({})
      .then(done.bind(null, null), done);
    });

    it('should return saved lecture', function (done) {
      var params = { videoId: 'CRACCCK' };

      request(app)
      .post('/api/users/' + user._id + '/classes/' + classe._id + '/lectures/')
      .set('Authorization', 'Bearer ' + user.token)
      .send(params)
      .expect(201)
      .expect('Content-Type', /json/)
      .then(function (res) {
        res.body.should.have.property('videoId');
        done();
      })
      .catch(done);
    });

    it('should return duplication error when video id is existed', function (done) {
      var params = { videoId: 'CRACCCK' };

      request(app)
      .post('/api/users/' + user._id + '/classes/' + classe._id + '/lectures/')
      .send(params)
      .set('Authorization', 'Bearer ' + user.token)
      .expect(201)
      .expect('Content-Type', /json/)
      .then(function () {
        return request(app)
        .post('/api/users/' + user._id + '/classes/' + classe._id + '/lectures/')
        .send(params)
        .set('Authorization', 'Bearer ' + user.token)
        .expect(500)
        .expect('Content-Type', /json/);
      })
      .then(function (res) {
        res.body.message.should.match(/exists/);
        done();
      })
      .catch(done);
    });
  });
});
