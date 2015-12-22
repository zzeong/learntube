'use strict';

var should = require('should');
var app = require('../../../app');
var request = require('supertest-as-promised').agent(app);
var mongoose = require('mongoose');
var User = require('../../../models/user.model');
var Note = require('../../../models/note.model');
var Rating = require('../../../models/rating.model');
var auth = require('../../../auth/auth.service');

mongoose.Promise = Promise;


describe('REST API:', function () {
  var user, videoId, playlistId;

  before(function (done) {
    videoId = 'sMKoNBRZM1M';
    playlistId = 'SHEWILLLOVEME';

    Promise.all([
      User.remove({}),
      Note.remove({}),
      Rating.remove({})
    ])
    .then(function () {
      user = new User({
        name: 'Fake User',
        email: 'test@test.com',
        password: 'password',
      });
      return user.save();
    })
    .then(function () {
      user = user.toObject();
      user.token = auth.signToken(user._id);
      done();
    })
    .catch(done);
  });

  after(function (done) {
    Promise.all([
      User.remove({}),
      Note.remove({}),
      Rating.remove({})
    ])
    .then(done.bind(null, null), done);
  });


  describe.only('POST /api/users/:id/notes', function () {
    var nid;

    afterEach(function (done) {
      request
      .delete('/api/users/' + user._id + '/notes/' + nid)
      .set('Authorization', 'Bearer ' + user.token)
      .then(function () {
        return Rating.remove({});
      })
      .then(done.bind(null, null))
      .catch(done);
    });

    it('should return saved note id when note is saved', function (done) {
      request
      .post('/api/users/' + user._id + '/notes')
      .set('Authorization', 'Bearer ' + user.token)
      .field('playlistId', playlistId)
      .field('videoId', videoId)
      .field('type', 'editor')
      .attach('file', './test/fixtures/dummy.html')
      .then(function (res) {
        var properties = ['_id', 'playlistId', 'videoId', 'type', 'resourceType', 'url'];
        res.body.should.have.properties(properties);
        res.body.should.not.have.property('userId');
        nid = res.body._id;
        done();
      })
      .catch(done);
    });

    it('should create rating model with initial point', function (done) {
      request
      .post('/api/users/' + user._id + '/notes')
      .set('Authorization', 'Bearer ' + user.token)
      .field('playlistId', playlistId)
      .field('videoId', videoId)
      .field('type', 'editor')
      .attach('file', './test/fixtures/dummy.html')
      .expect(201)
      .expect('Content-Type', /json/)
      .then(function (res) {
        nid = res.body._id;
        return Rating.findOne({ playlistId: playlistId }).exec();
      })
      .then(function (rating) {
        should.exist(rating);
        rating.points.should.be.equal(1);
        done();
      })
      .catch(done);
    });

    it('should increase class rating points', function (done) {
      Rating.create({
        playlistId: playlistId,
        points: 1
      })
      .then(function () {
        return request
        .post('/api/users/' + user._id + '/notes')
        .set('Authorization', 'Bearer ' + user.token)
        .field('playlistId', playlistId)
        .field('videoId', videoId)
        .field('type', 'editor')
        .attach('file', './test/fixtures/dummy.html')
        .expect(201)
        .expect('Content-Type', /json/);
      })
      .then(function (res) {
        nid = res.body._id;
        return Rating.findOne({ playlistId: playlistId }).exec();
      })
      .then(function (rating) {
        rating.points.should.be.equal(2);
        done();
      })
      .catch(done);
    });
  });



  describe('GET /api/users/:id/notes', function () {
    var nid;

    before(function (done) {
      request
      .post('/api/users/' + user._id + '/notes')
      .set('Authorization', 'Bearer ' + user.token)
      .field('playlistId', playlistId)
      .field('videoId', videoId)
      .field('type', 'editor')
      .attach('file', './test/fixtures/dummy.html')
      .then(function (res) {
        nid = res.body._id;
        done();
      })
      .catch(done);
    });

    after(function (done) {
      request
      .delete('/api/users/' + user._id + '/notes/' + nid)
      .set('Authorization', 'Bearer ' + user.token)
      .then(done.bind(null, null), done);
    });

    it('should return queried notes', function (done) {
      request
      .get('/api/users/' + user._id + '/notes')
      .set('Authorization', 'Bearer ' + user.token)
      .query({ videoId: videoId })
      .expect(200)
      .expect('Content-Type', /json/)
      .then(function (res) {
        res.body.should.have.instanceof(Array);
        res.body.should.have.length(1);
        res.body[0].should.have.property('_id');
        done();
      })
      .catch(done);
    });


    describe('/:nid', function () {
      it('should return specific note doc', function (done) {
        request
        .get('/api/users/' + user._id + '/notes/' + nid)
        .set('Authorization', 'Bearer ' + user.token)
        .expect(200)
        .expect('Content-Type', /json/)
        .then(function (res) {
          res.body.should.have.property('_id');
          done();
        })
        .catch(done);
      });

      describe('/get-contents', function () {
        it('should return note contents equal to contents which have been saved when note is got', function (done) {
          request
          .get('/api/users/' + user._id + '/notes/' + nid + '/get-contents')
          .set('Authorization', 'Bearer ' + user.token)
          .expect(200)
          .expect('Content-Type', /json/)
          .then(function (res) {
            res.body.should.have.property('_id');
            res.body.should.have.property('contents');
            done();
          })
          .catch(done);
        });
      });
    });
  });


  describe('PUT /api/users/:id/notes/:nid', function () {
    var nid;

    before(function (done) {
      request
      .post('/api/users/' + user._id + '/notes')
      .set('Authorization', 'Bearer ' + user.token)
      .field('playlistId', playlistId)
      .field('videoId', videoId)
      .field('type', 'editor')
      .attach('file', './test/fixtures/dummy.html')
      .then(function (res) {
        nid = res.body._id;
        done();
      })
      .catch(done);
    });

    after(function (done) {
      request
      .delete('/api/users/' + user._id + '/notes/' + nid)
      .set('Authorization', 'Bearer ' + user.token)
      .then(done.bind(null, null), done);
    });

    it('should return updated note', function (done) {
      request
      .put('/api/users/' + user._id + '/notes/' + nid)
      .set('Authorization', 'Bearer ' + user.token)
      .field('playlistId', playlistId)
      .field('videoId', videoId)
      .field('type', 'editor')
      .attach('file', './test/fixtures/dummy.html')
      .expect(201)
      .expect('Content-Type', /json/)
      .then(function (res) {
        res.body.should.have.property('_id');
        done();
      })
      .catch(done);
    });
  });


  describe('DELETE /api/users/:id/notes/:nid', function () {
    var nid;

    beforeEach(function (done) {
      request
      .post('/api/users/' + user._id + '/notes')
      .set('Authorization', 'Bearer ' + user.token)
      .field('playlistId', playlistId)
      .field('videoId', videoId)
      .field('type', 'editor')
      .attach('file', './test/fixtures/dummy.html')
      .then(function (res) {
        nid = res.body._id;
        done();
      })
      .catch(done);
    });

    afterEach(function (done) {
      Promise.all([
        Note.remove({}),
        Rating.remove({})
      ])
      .then(done.bind(null, null), done);
    });

    it('should return 204 status code when note is removed', function (done) {
      request
      .delete('/api/users/' + user._id + '/notes/' + nid)
      .set('Authorization', 'Bearer ' + user.token)
      .expect(204)
      .then(done.bind(null, null), done);
    });

    it('should decrease class rating points', function (done) {
      Rating.findOneAndUpdate({
        playlistId: playlistId
      }, {
        $inc: { points: 2 }
      }).exec()
      .then(function () {
        return request
        .delete('/api/users/' + user._id + '/notes/' + nid)
        .set('Authorization', 'Bearer ' + user.token)
        .expect(204);
      })
      .then(function () {
        return Rating.findOne({ playlistId: playlistId }).exec();
      })
      .then(function (rating) {
        rating.points.should.be.equal(2);
        done();
      })
      .catch(done);
    });

    it('should remove a rating doc when class have no notes', function (done) {
      request
      .delete('/api/users/' + user._id + '/notes/' + nid)
      .set('Authorization', 'Bearer ' + user.token)
      .expect(204)
      .then(function () {
        return Rating.findOne({ playlistId: playlistId }).exec();
      })
      .then(function (rating) {
        should.not.exist(rating);
        done();
      })
      .catch(done);
    });
  });


});
