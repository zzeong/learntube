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
  var id, nid, noteContents;

  this.timeout(5000);

  before(function(done){
      User.remove().exec();
      var user = new User(userData);
      user.save(function(err) {
        id = user._id;
        done();
      });

  });

  describe('POST /api/users/:id/notes', function() {
    // before는 it보다 먼저 실행되는 구문
    before(function(done) {
      noteContents = '<h1>NOTE API TEST</h1>';
      done();
    });

    it('should return saved note when note is saved', function(done) {
      var params = {
        videoId: 'sMKoNBRZM1M',
        contents: noteContents
      };

      request(app)
      .post('/api/users/' + id + '/notes')
      .send(params)
      .expect(201)  // 201은 성공했다는 뜻
      .expect('Content-Type', /json/)
      .end(function (err, res) {
          if(err) { return done(err); }
          should.exist(res.body._id);
          nid = res.body._id;
        done();
      });
    });

  });




  describe('GET /api/users/:id/notes', function() {

    it('should return note contents equal to contents which have been saved when note is gotten', function(done) {
      request(app)
      .get('/api/users/' + id + '/notes/' + nid)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
          if(err) { return done(err); }  
          res.body.should.have.property('message');
          res.body.should.have.property('contents');
          res.body.message.should.equal('gotten');
          res.body.contents.should.equal(noteContents);
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
        res.body.should.have.property('message');
        res.body.message.should.equal('removed');
        done(); 
      });
    });
  });
});
