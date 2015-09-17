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

describe('REST API:', function() {
  var user;
  var id = mongoose.Types.ObjectId();

  describe('POST /api/users/:id/classes/:cid/lectures/', function() {
    var classData, cid;
    var params = {
      playlistId: 'YYY',
      videoId: 'XXX'
    };

    describe('when lecture is save', function() {

      before(function() {
        params = {
          videoId: 'XXX'
        };
      });

      beforeEach(function(done) {
        Class.remove().exec(); 
        classData = {
          userId: id,
          playlistId: 'ZZZ',
        };

        var classe = new Class(classData);
        classe.save(function(err, savedClass) {
          cid = savedClass._id;
          done();
        });
      });

      it('should return class which saved lecture', function(done) {
        request(app)
        .post('/api/users/' + id + '/classes/' + cid + '/lectures/')
        .expect(201)
        .expect('Content-Type', /json/)
        .send(params)
        .end(function (err, res) {
          if(err) { return done(err); } 
          res.body.should.have.property('lectures');
          res.body.lectures.should.have.length(1);
          done();
        });
      });

    });
  });

});
