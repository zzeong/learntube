'use strict';

var should = require('should');
var app = require('../../../../app');
var request = require('supertest');
var mongoose = require('mongoose');
var auth = require('../../../../auth/auth.service.js');
var Class = require('../../../../models/class.model');
var User = require('../../../../models/user.model');

describe('REST API:', function () {
  var user;

  describe('POST /api/users/:id/classes/:cid/lectures/', function () {
    var classData, cid;

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
      .then(function (u) {
        user = u.toObject();
        user.token = auth.signToken(user._id);
        done();
      })
      .catch(function (err) { done(err); });
    });

    after(function (done) {
      Promise.all([
        User.remove({}),
        Class.remove({})
      ])
      .then(function () { done(); })
      .catch(function (err) { done(err); });
    });

    describe('when lecture is save', function () {
      var params;

      before(function () {
        params = { videoId: 'XXX' };
      });

      beforeEach(function (done) {
        var classe = {
          userId: user._id,
          playlistId: 'ZZZ',
        };

        Class.create(classe)
        .then(function (created) {
          cid = created._id;
          done();
        })
        .catch(function (err) { done(err); });
      });

      it('should return class which saved lecture', function (done) {
        request(app)
        .post('/api/users/' + user._id + '/classes/' + cid + '/lectures/')
        .set('Authorization', 'Bearer ' + user.token)
        .expect(201)
        .expect('Content-Type', /json/)
        .send(params)
        .end(function (err, res) {
          if (err) { return done(err); }
          res.body.should.have.property('lectures');
          res.body.lectures.should.have.length(1);
          done();
        });
      });

    });
  });

});
