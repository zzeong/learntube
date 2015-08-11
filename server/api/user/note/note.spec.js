'use strict';

var should = require('should');
var app = require('../../../app');
var request = require('supertest');
var User = require('../user.model');

var userInfo = {
  provider: 'local',
  name: 'Fake User',
  email: 'test@test.com',
  password: 'password',
  notes: []
};
var note = {
  videoId: 'sMKoNBRZM1M',
  hash: '7121cd645707ec47efa33393028473c7',
  url: 'https://learntubebucket.s3.amazonaws.com/test@test.com/7121cd645707ec47efa33393028473c7',
  s3Path: '/test@test.com/7121cd645707ec47efa33393028473c7',
};

describe('Note sub-docs in User Model', function() {
  var user;

  before(function(done) {
    User.remove().exec();
    user = new User(userInfo);
    user.save(function() { done(); });
  });


  it('should begin with no notes', function(done) {
    User.findOne(user, function(err, findedUser) {
      findedUser.notes.should.be.instanceof(Array);
      findedUser.notes.should.have.length(0);
      done();
    });
  });

  it('should have just one note', function(done) {
    User.findOne(user, function(err, findedUser) {
      findedUser.notes.push(note);
      findedUser.notes.should.have.length(1); 
      findedUser.save(function (err) {
        if(err) { return done(err); }
        done();
      });
    });
  });

});



describe('REST API:', function() {
  var id, nid, noteContents;

  this.timeout(5000);

  describe('POST /api/users/:id/notes', function() {
    var user;

    before(function(done) {
      noteContents = '<h1>NOTE API TEST</h1>';

      User.remove().exec();
      user = new User(userInfo);
      user.save(function(err, savedUser) {
        id = savedUser._id;
        done();
      });
    });

    it('should return "saved" message when note is saved', function(done) {
      var params = {
        videoId: 'sMKoNBRZM1M',
        contents: noteContents
      };

      request(app)
      .post('/api/users/' + id + '/notes/')
      .send(params)
      .expect(201)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if(err) { return done(err); } 
        res.body.should.have.property('message');
        res.body.should.have.property('nid');
        res.body.message.should.equal('saved');
        nid = res.body.nid;
        done();
      });
    });

    it('should save uploaded s3 path which is equal to what is combined email and hash', function(done) {
      User.findById(id, function(err, user) {
        var noteDoc = user.notes.id(nid);
        var uploadedPath = '/' + userInfo.email + '/' + noteDoc.hash;
        noteDoc.s3Path.should.equal(uploadedPath);
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
