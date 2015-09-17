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
  var id, noteContents, videoId, playlistId;

  this.timeout(15000);

  before(function(done){
    videoId = 'sMKoNBRZM1M';
    playlistId = 'SHEWILLLOVEME';

    User.remove().exec();
    var user = new User(userData);
    user.save(function(err) {
      Note.remove().exec();
      id = user._id;
      done();
    });
  });



  describe('POST /api/users/:id/notes', function() {
    var nid;

    afterEach(function(done) {
      request(app)
      .delete('/api/users/' + id + '/notes/' + nid)
      .end(function(err, res) {
        if(err) { return done(err); }
        done();
      });
    });

    it('should return saved note id when note is saved', function(done) {
      request(app)
      .post('/api/users/' + id + '/notes')
      .field('playlistId', playlistId)
      .field('videoId', videoId)
      .field('type', 'editor')
      .attach('file', 'test/fixtures/dummy.html')
      .end(function(err, res) {
        if(err) { return done(err); } 
        res.body.should.have.property('_id');
        nid = res.body._id;
        done();
      });
    }); 
  });


  describe('GET /api/users/:id/notes', function() {
    var nid;

    before(function(done) {
      request(app)
      .post('/api/users/' + id + '/notes')
      .field('playlistId', playlistId)
      .field('videoId', videoId)
      .field('type', 'editor')
      .attach('file', 'test/fixtures/dummy.html')
      .end(function(err, res) {
        if(err) { return done(err); } 
        nid = res.body._id;
        done();
      }); 
    });

    after(function(done) {
      request(app)
      .delete('/api/users/' + id + '/notes/' + nid)
      .end(function(err, res) {
        if(err) { return done(err); }
        done();
      });
    });

    it('should return queried notes', function(done) {
      request(app)
      .get('/api/users/' + id + '/notes')
      .query({ videoId: videoId })
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if(err) { return done(err); }
        res.body.should.have.instanceof(Array);
        res.body.should.have.length(1);
        res.body[0].should.have.property('_id');
        done();
      });
    });


    describe('/meta', function() {
      it('should return meta data of notes which don\'t contain note contents', function(done) {
        request(app)
        .get('/api/users/' + id + '/notes/meta')
        .query({ playlistId: playlistId })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) { return done(err); } 
          res.body.should.have.instanceof(Array);
          res.body.should.have.length(1);
          res.body[0].should.have.property('_id');
          res.body[0].should.have.property('videoId');
          res.body[0].should.not.have.property('contents');
          done();
        });
      });

    });


    describe('/:nid', function() {
      it('should return specific note doc', function(done) {
        request(app)
        .get('/api/users/' + id + '/notes/' + nid)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) { return done(err); }
          res.body.should.have.property('_id');
          done();
        });
      });
      
      describe('/get-contents', function() {
        it('should return note contents equal to contents which have been saved when note is got', function(done) {
          request(app)
          .get('/api/users/' + id + '/notes/' + nid + '/get-contents')
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if(err) { return done(err); }
            res.body.should.have.property('_id');
            res.body.should.have.property('contents');
            done();
          });
        });
      });
    });
  });


  describe('PUT /api/users/:id/notes/:nid', function() {
    var nid;

    before(function(done) {
      request(app)
      .post('/api/users/' + id + '/notes')
      .field('playlistId', playlistId)
      .field('videoId', videoId)
      .field('type', 'editor')
      .attach('file', 'test/fixtures/dummy.html')
      .end(function(err, res) {
        if(err) { return done(err); } 
        nid = res.body._id;
        done();
      }); 
    });

    after(function(done) {
      request(app)
      .delete('/api/users/' + id + '/notes/' + nid)
      .end(function(err, res) {
        if(err) { return done(err); }
        done();
      });
    });

    it('should return updated note', function(done) {
      request(app)
      .put('/api/users/' + id + '/notes/' + nid)
      .field('playlistId', playlistId)
      .field('videoId', videoId)
      .field('type', 'editor')
      .attach('file', 'test/fixtures/dummy.html')
      .expect(201)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if(err) { return done(err); }
        res.body.should.have.property('_id');
        done();
      });
    });
  });


  describe('DELETE /api/users/:id/notes/:nid', function() {
    var nid;

    before(function(done) {
      request(app)
      .post('/api/users/' + id + '/notes')
      .field('playlistId', playlistId)
      .field('videoId', videoId)
      .field('type', 'editor')
      .attach('file', 'test/fixtures/dummy.html')
      .end(function(err, res) {
        if(err) { return done(err); } 
        nid = res.body._id;
        done();
      }); 
    });

    it('should return "removed" message when note is removed', function(done) {
      request(app)
      .delete('/api/users/' + id + '/notes/' + nid)
      .expect(204)
      .end(function(err, res) {
        if(err) { return done(err); }
        done();
      });
    });
  });


});
