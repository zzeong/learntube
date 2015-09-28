'use strict';

var should = require('should');
var app = require('../../../app');
var request = require('supertest');
var mongoose = require('mongoose');
var User = require('../user.model');
var Class = require('./class.model');

var userData = {
  provider: 'local',
  name: 'Fake User',
  email: 'test@test.com',
  password: 'password',
  classes: []
};

describe('REST API:', function () {
  var user;
  var id = mongoose.Types.ObjectId();

  describe('POST /api/users/:id/classes', function () {
    var params;

    describe('when class is save', function () {

      before(function () {
        params = {
          playlistId: 'ZZZ'
        };
      });

      it('should return saved class', function (done) {
        request(app)
        .post('/api/users/' + id + '/classes/')
        .send(params)
        .expect(201)
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          if (err) { return done(err); }
          res.body.should.have.property('_id');
          res.body.should.have.property('userId');
          res.body.userId.should.equal(id + '');
          res.body.should.have.property('playlistId');
          res.body.playlistId.should.equal(params.playlistId);
          done();
        });
      });

    });
  });

  describe('GET /api/users/:id/classes/', function () {
    beforeEach(function (done) {
      var classes = [{
        userId: id,
        playlistId: 'Q1W2'
      }, {
        userId: id,
        playlistId: 'E3R4'
      }];

      Class.remove({})
      .then(function () {
        return Class.create(classes);
      })
      .then(function () { done(); })
      .catch(function (err) { done(err); });
    });

    it('should get all classes that have 2 items', function (done) {
      request(app)
      .get('/api/users/' + id + '/classes/')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) { return done(err); }
        res.body.should.have.length(2);
        done();
      });
    });
  });

  describe('DELETE /api/users/:id/classes/:cid', function () {
    var cid;

    beforeEach(function (done) {
      Class.remove({})
      .then(function () {
        var classe = new Class({
          userId: id,
          playlistId: 'ZZZ'
        });
        return classe.save();
      })
      .then(function (classe) {
        cid = classe._id;
        done();
      })
      .catch(function (err) { done(err); });
    });

    it('should makes Class collection has no docs after class is removed', function (done) {
      request(app)
      .delete('/api/users/' + id + '/classes/' + cid)
      .expect(204)
      .end(function (err, res) {
        if (err) { return done(err); }
        Class.find({}).exec()
        .then(function (classes) {
          classes.should.have.length(0);
          done();
        })
        .catch(function (err) { done(err); });
      });
    });

  });
});
