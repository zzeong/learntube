'use strict';

var should = require('should');
var app = require('../../../../app');
var request = require('supertest');
var mongoose = require('mongoose');
var User = require('../../user.model');
var Class = require('../class.model');
var Lecture = require('./lecture.model');

var userData = {
  provider: 'local',
  name: 'Fake User',
  email: 'test@test.com',
  password: 'password',
  classes: []
};

describe('REST API:', function () {
  var id = mongoose.Types.ObjectId();

  describe('POST /api/users/:id/classes/:cid/lectures/', function () {
    var classData, cid;

    before(function (done) {
      Class.remove({})
      .then(function () { done(); })
      .catch(function (err) { done(err); });
    });

    after(function (done) {
      Class.remove({})
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
          userId: id,
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
        .post('/api/users/' + id + '/classes/' + cid + '/lectures/')
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
