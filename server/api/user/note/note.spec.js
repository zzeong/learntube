'use strict';

var should = require('should');
var app = require('../../../app');
var request = require('supertest');
var mongoose = require('mongoose');
var User = require('../../../models/user.model');
var Note = require('../../../models/note.model');
var Rating = require('../../../models/rating.model');
var path = require('path');

var Promise = mongoose.Promise = require('promise');


describe('REST API:', function () {
  var id, noteContents, videoId, playlistId;

  before(function (done) {
    videoId = 'sMKoNBRZM1M';
    playlistId = 'SHEWILLLOVEME';

    Promise.all([
      User.remove({}),
      Note.remove({}),
      Rating.remove({})
    ])
    .then(function () {
      var user = new User({
        name: 'Fake User',
        email: './test@test.com',
        password: 'password',
      });
      return user.save();
    })
    .then(function (user) {
      id = user._id;
      done();
    });
  });

  after(function (done) {
    Promise.all([
      User.remove({}),
      Note.remove({}),
      Rating.remove({})
    ]).then(function () {
      done();
    });
  });


  describe('POST /api/users/:id/notes', function () {
    var nid;

    afterEach(function (done) {
      request(app)
      .delete('/api/users/' + id + '/notes/' + nid)
      .end(function (err, res) {
        if (err) { return done(err); }

        Rating.remove({})
        .then(function () {
          done();
        });
      });
    });

    it('should return saved note id when note is saved', function (done) {
      request(app)
      .post('/api/users/' + id + '/notes')
      .field('playlistId', playlistId)
      .field('videoId', videoId)
      .field('type', 'editor')
      .attach('file', './test/fixtures/dummy.html')
      .end(function (err, res) {
        if (err) { return done(err); }
        res.body.should.have.property('_id');
        nid = res.body._id;
        done();
      });
    });

    it('should create rating model with initial point', function (done) {
      request(app)
      .post('/api/users/' + id + '/notes')
      .field('playlistId', playlistId)
      .field('videoId', videoId)
      .field('type', 'editor')
      .attach('file', './test/fixtures/dummy.html')
      .expect(201)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) { return done(err); }
        nid = res.body._id;

        Rating.findOne({ playlistId: playlistId }).exec()
        .then(function (rating) {
          should.exist(rating);
          rating.points.should.be.equal(1);
          done();
        })
        .catch(function (err) { done(err); });
      });
    });

    it('should increase class rating points', function (done) {
      Rating.create({
        playlistId: playlistId,
        points: 1
      }, function (err, rating) {
        if (err) { return done(err); }

        request(app)
        .post('/api/users/' + id + '/notes')
        .field('playlistId', playlistId)
        .field('videoId', videoId)
        .field('type', 'editor')
        .attach('file', './test/fixtures/dummy.html')
        .expect(201)
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          if (err) { return done(err); }
          nid = res.body._id;

          Rating.findOne({ playlistId: playlistId }).exec()
          .then(function (rating) {
            rating.points.should.be.equal(2);
            done();
          })
          .catch(function (err) { done(err); });
        });
      });

    });
  });



  describe('GET /api/users/:id/notes', function () {
    var nid;

    before(function (done) {
      request(app)
      .post('/api/users/' + id + '/notes')
      .field('playlistId', playlistId)
      .field('videoId', videoId)
      .field('type', 'editor')
      .attach('file', './test/fixtures/dummy.html')
      .end(function (err, res) {
        if (err) { return done(err); }
        nid = res.body._id;
        done();
      });
    });

    after(function (done) {
      request(app)
      .delete('/api/users/' + id + '/notes/' + nid)
      .end(function (err, res) {
        if (err) { return done(err); }
        done();
      });
    });

    it('should return queried notes', function (done) {
      request(app)
      .get('/api/users/' + id + '/notes')
      .query({ videoId: videoId })
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) { return done(err); }
        res.body.should.have.instanceof(Array);
        res.body.should.have.length(1);
        res.body[0].should.have.property('_id');
        done();
      });
    });


    describe('/:nid', function () {
      it('should return specific note doc', function (done) {
        request(app)
        .get('/api/users/' + id + '/notes/' + nid)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          if (err) { return done(err); }
          res.body.should.have.property('_id');
          done();
        });
      });

      describe('/get-contents', function () {
        it('should return note contents equal to contents which have been saved when note is got', function (done) {
          request(app)
          .get('/api/users/' + id + '/notes/' + nid + '/get-contents')
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function (err, res) {
            if (err) { return done(err); }
            res.body.should.have.property('_id');
            res.body.should.have.property('contents');
            done();
          });
        });
      });
    });
  });


  describe('PUT /api/users/:id/notes/:nid', function () {
    var nid;

    before(function (done) {
      request(app)
      .post('/api/users/' + id + '/notes')
      .field('playlistId', playlistId)
      .field('videoId', videoId)
      .field('type', 'editor')
      .attach('file', './test/fixtures/dummy.html')
      .end(function (err, res) {
        if (err) { return done(err); }
        nid = res.body._id;
        done();
      });
    });

    after(function (done) {
      request(app)
      .delete('/api/users/' + id + '/notes/' + nid)
      .end(function (err, res) {
        if (err) { return done(err); }
        done();
      });
    });

    it('should return updated note', function (done) {
      request(app)
      .put('/api/users/' + id + '/notes/' + nid)
      .field('playlistId', playlistId)
      .field('videoId', videoId)
      .field('type', 'editor')
      .attach('file', './test/fixtures/dummy.html')
      .expect(201)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) { return done(err); }
        res.body.should.have.property('_id');
        done();
      });
    });
  });


  describe('DELETE /api/users/:id/notes/:nid', function () {
    var nid;

    beforeEach(function (done) {
      request(app)
      .post('/api/users/' + id + '/notes')
      .field('playlistId', playlistId)
      .field('videoId', videoId)
      .field('type', 'editor')
      .attach('file', './test/fixtures/dummy.html')
      .end(function (err, res) {
        if (err) { return done(err); }
        nid = res.body._id;
        done();
      });
    });

    afterEach(function (done) {
      Promise.all([
        Note.remove({}),
        Rating.remove({})
      ])
      .then(function () { done(); });
    });

    it('should return 204 status code when note is removed', function (done) {
      request(app)
      .delete('/api/users/' + id + '/notes/' + nid)
      .expect(204)
      .end(function (err, res) {
        if (err) { return done(err); }
        done();
      });
    });

    it('should decrease class rating points', function (done) {
      Rating.findOneAndUpdate({
        playlistId: playlistId
      }, {
        $inc: { points: 2 }
      }, function (err) {
        if (err) { return done(err); }

        request(app)
        .delete('/api/users/' + id + '/notes/' + nid)
        .expect(204)
        .end(function (err, res) {
          if (err) { return done(err); }

          Rating.findOne({ playlistId: playlistId }).exec()
          .then(function (rating) {
            rating.points.should.be.equal(2);
            done();
          })
          .catch(function (err) { done(err); });
        });
      });
    });

    it('should remove a rating doc when class have no notes', function (done) {
      request(app)
      .delete('/api/users/' + id + '/notes/' + nid)
      .expect(204)
      .end(function (err, res) {
        if (err) { return done(err); }

        Rating.findOne({ playlistId: playlistId }).exec()
        .then(function (rating) {
          should.not.exist(rating);
          done();
        })
        .catch(function (err) { done(err); });
      });
    });
  });


});
