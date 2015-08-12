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

describe('REST API:', function() {
  var user;
  var id = mongoose.Types.ObjectId();

  describe('POST /api/users/:id/classes', function() {
    var params;

    describe('when class is save', function() {

      before(function() {
        params = {
          playlistId: 'ZZZ'
        };
      });

      it('should return 201', function(done) {
        request(app)
        .post('/api/users/' + id + '/classes/')
        .send(params)
        .expect(201)
        .end(function(err, res) {
          if(err) { return done(err); }
          done(); 
        });
      });

      it('should return json', function(done) {
        request(app)
        .post('/api/users/' + id + '/classes/')
        .send(params)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) { return done(err); }
          done(); 
        });
      });

      it('should return saved class', function(done) {
        request(app)
        .post('/api/users/' + id + '/classes/')
        .send(params)
        .end(function (err, res) {
          if(err) { return done(err); } 
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

  describe('DELETE /api/users/:id/classes/:cid', function() {
    var classData, cid;

    beforeEach(function(done) {
      Class.remove().exec();

      classData = {
        userId: id,
        playlistId: 'ZZZ'
      };

      var classe = new Class(classData);
      classe.save(function(err, savedClass) {
        cid = savedClass._id;
        done();
      });
    });

    it('should return 204 when class is removed', function(done) {
      request(app)
      .delete('/api/users/' + id + '/classes/' + cid)
      .expect(204)
      .end(function(err, res) {
        if(err) { return done(err); }
        done(); 
      });
    });

    it('should makes Class collection has no docs after class is removed', function(done) {
      request(app)
      .delete('/api/users/' + id + '/classes/' + cid)
      .end(function(err, res) {
        if(err) { return done(err); } 
        Class.find({}, function(err, classes) {
          classes.should.have.length(0);
          done();
        });
      });
    });

  });
});
