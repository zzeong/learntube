'use strict';

require('should');
var app = require('../../../app');
var request = require('supertest-as-promised');
var mongoose = require('mongoose');
var auth = require('../../../auth/auth.service');
var User = require('../../../models/user.model');
var Class = require('../../../models/class.model');

var Promise = mongoose.Promise = require('promise');

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
        classes: []
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
    Promise.all([
      User.remove({}),
      Class.remove({})
    ])
    .then(done.bind(null, null), done);
  });

  describe('POST /api/users/:id/classes', function () {
    beforeEach(function (done) {
      Class.remove({})
      .then(done.bind(null, null), done);
    });

    afterEach(function (done) {
      Class.remove({})
      .then(done.bind(null, null), done);
    });

    it('should return saved class', function (done) {
      var params = {
        playlistId: 'CRACCCK'
      };

      request(app)
      .post('/api/users/' + user._id + '/classes/')
      .set('Authorization', 'Bearer ' + user.token)
      .send(params)
      .expect(201)
      .expect('Content-Type', /json/)
      .then(function (res) {
        res.body.should.have.property('_id');
        res.body.should.have.property('userId');
        res.body.should.have.property('playlistId');
        res.body.userId.should.equal(user._id + '');
        res.body.playlistId.should.equal(params.playlistId);
        done();
      })
      .catch(done);
    });

    it('should return duplication error when video id is existed', function (done) {
      var params = { playlistId: 'CRACCCK' };

      request(app)
      .post('/api/users/' + user._id + '/classes/')
      .set('Authorization', 'Bearer ' + user.token)
      .send(params)
      .expect(201)
      .expect('Content-Type', /json/)
      .then(function () {
        return request(app)
        .post('/api/users/' + user._id + '/classes/')
        .set('Authorization', 'Bearer ' + user.token)
        .send(params)
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

  describe('GET /api/users/:id/classes/', function () {
    beforeEach(function (done) {
      var classes = [{
        userId: user._id,
        playlistId: 'Q1W2'
      }, {
        userId: user._id,
        playlistId: 'E3R4'
      }];

      Class.remove({})
      .then(function () {
        return Class.create(classes);
      })
      .then(done.bind(null, null), done);
    });

    it('should get all classes that have 2 items', function (done) {
      request(app)
      .get('/api/users/' + user._id + '/classes/')
      .set('Authorization', 'Bearer ' + user.token)
      .expect(200)
      .expect('Content-Type', /json/)
      .then(function (res) {
        res.body.should.have.length(2);
        done();
      })
      .catch(done);
    });
  });

  describe('DELETE /api/users/:id/classes/:cid', function () {
    var cid;

    beforeEach(function (done) {
      Class.remove({})
      .then(function () {
        var classe = new Class({
          userId: user._id,
          playlistId: 'ZZZ'
        });
        return classe.save();
      })
      .then(function (classe) {
        cid = classe._id;
        done();
      })
      .catch(done);
    });

    it('should makes Class collection has no docs after class is removed', function (done) {
      request(app)
      .delete('/api/users/' + user._id + '/classes/' + cid)
      .set('Authorization', 'Bearer ' + user.token)
      .expect(204)
      .then(function () {
        return Class.find({}).exec();
      })
      .then(function (classes) {
        classes.should.have.length(0);
        done();
      })
      .catch(done);
    });
  });
});
