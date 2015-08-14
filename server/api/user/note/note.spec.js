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

// 임의 노트
var noteData = {
  videoId: 'sMKoNBRZM1M',
  hash: '7121cd645707ec47efa33393028473c7',
  url: 'https://learntubebucket.s3.amazonaws.com/test@test.com/7121cd645707ec47efa33393028473c7',
  s3Path: '/test@test.com/7121cd645707ec47efa33393028473c7',
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







    // 여기는 일단 패스. (문맥상 어울리지 않는 테스트)
    xit('should save uploaded s3 path which is equal to what is combined email and hash', function(done) {
      // NoteSchema에서 nid로 note를 찾아 콜백함수의 note에 할당한다. 
      note.findById(nid, function(err, resNote) {
        if(err) { return done(err); }

        // noteDoc의 s3Path가 uploadedPath와 일치해야 한다. 
        
        // var noteDoc = note.id(nid);  ▶ 얘가 필요없는 이유. 
        // 이유는 뭐냐면, s3Path와 hash와 같은 정보는 NoteSchema에 있는 것들인데, 
        // 위에 Note.으로 이미 NoteSchema에 접근을 했단말이야. 
        // 그리고 그 결과로 note에 받아왔고. 즉!
        // noteDoc이 결국 note와 완전 똑같은녀석이란 말이지. 
        // 그러니깐 noteDoc을 따로 선언해서 뭔가를 할당할 필요가 없어졌어. 
        var uploadedPath = '/' + userInfo.email + '/' + resNote.hash;

        resNote.s3Path.should.equal(uploadedPath);
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
    //var note, nid, user, id, noteContents;

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
