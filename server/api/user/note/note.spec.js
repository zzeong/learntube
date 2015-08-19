'use strict';

var should = require('should');
var app = require('../../../app');
var request = require('supertest');
var mongoose = require('mongoose');
var User = require('../user.model');
var Note = require('./note.model');


// 임의 유저
var userData = {
  provider: 'local',
  name: 'Fake User',
  email: 'test@test.com',
  password: 'password',
};


describe('REST API:', function() {
  var id, nid, noteContents, videoId;

  this.timeout(10000);

  before(function(done){
    videoId = 'sMKoNBRZM1M';

    User.remove().exec();
    var user = new User(userData);
    user.save(function(err) {
      id = user._id;
      done();
    });
  });




  describe('POST /api/users/:id/notes', function() {
    before(function(done) {
      noteContents = '<h1>NOTE API TEST</h1>';
      done();
    });

    it('should return saved note when note is saved', function(done) {
      var params = {
        videoId: videoId,
        contents: noteContents
      };

      request(app)
      .post('/api/users/' + id + '/notes')
      .send(params)
      .expect(201)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if(err) { return done(err); }
        res.body.should.have.property('_id');
        nid = res.body._id;
        done();
      });
    });
  });




  describe('GET /api/users/:id/notes', function() {
    it('should return queried notes', function(done) {
      request(app)
      .get('/api/users/' + id + '/notes')
      .query({ videoId: videoId })
      .end(function(err, res) {
        if(err) { return done(err); }
        res.body.should.have.instanceof(Array);
        res.body.should.have.length(1);
        res.body[0].should.have.property('_id');
        res.body[0].should.have.property('contents');
        done();
      });
    });
  });




  describe('GET /api/users/:id/notes/:nid', function() {
    it('should return note contents equal to contents which have been saved when note is gotten', function(done) {
      request(app)
      .get('/api/users/' + id + '/notes/' + nid)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if(err) { return done(err); }
        res.body.should.have.property('_id');
        res.body.should.have.property('contents');
        res.body.contents.should.equal(noteContents);
        done();
      });
    });
  });


  describe('PUT /api/users/:id/notes/:nid', function() {
    before(function(done) {
      noteContents = '<h1>UPDATED CONTENTS</h1>';
      done();
    });


    it('should return updated note', function(done) {
      var params = {
        videoId: videoId,
        contents: noteContents
      };

      request(app)
      .put('/api/users/' + id + '/notes/' + nid)
      .send(params)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if(err) { return done(err); }
        res.body.should.have.property('_id');
        res.body._id.should.equal(nid);
        done();
      });
    });
  });


  describe('DELETE /api/users/:id/notes/:nid', function() {
    it('should return "removed" message when note is removed', function(done) {
      request(app)
      .delete('/api/users/' + id + '/notes/' + nid)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if(err) { return done(err); }
        res.body.should.have.property('_id');
        res.body._id.should.equal(nid);
        done();
      });
    });
  });
});
