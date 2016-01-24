'use strict';

require('should');
var app = require('../../../app');
var request = require('supertest-as-promised').agent(app);
var mongoose = require('mongoose');
var _ = require('lodash');
var auth = require('../../../auth/auth.service');
var User = require('../../../models/user.model');
var Handout = require('../../../models/handout.model');

mongoose.Promise = Promise;


describe('REST API:', () => {
  var user;

  before((done) => {
    User.remove({})
    .then(() => {
      user = new User({
        name: 'Fake User',
        email: 'test@test.com',
        password: 'password'
      });

      return user.save();
    })
    .then(() => {
      user = user.toObject();
      user.token = auth.signToken(user._id);
      done();
    })
    .catch(done);
  });

  after((done) => {
    User.remove({})
    .then(done.bind(null, null), done);
  });

  describe('POST /api/users/:id/handouts', () => {
    beforeEach((done) => {
      Handout.remove({})
      .then(done.bind(null, null), done);
    });

    afterEach((done) => {
      Handout.remove({})
      .then(done.bind(null, null), done);
    });

    it('should return created \'handout model doc\'', (done) => {
      request
      .post(`/api/users/${user._id}/handouts`)
      .set('Authorization', `Bearer ${user.token}`)
      .field('playlistId', 'QWER')
      .field('videoId', 'ASDF')
      .attach('file', './test/fixtures/dummy.html')
      .expect(201)
      .expect('Content-Type', /json/)
      .then((res) => {
        let props = ['_uploader', 'playlistId', 'videoId', 'fileName', 's3Path'];
        res.body.should.have.properties(props);
        done();
      })
      .catch(done);
    });
  });


  describe('GET /api/users/:id/handouts', () => {
    let handoutIds = null;

    before((done) => {
      Handout.remove({})
      .then(() => {
        var requests = [0, 1, 2].map((n) => {
          return request
          .post(`/api/users/${user._id}/handouts`)
          .set('Authorization', `Bearer ${user.token}`)
          .field('playlistId', 'QWER')
          .field('videoId', `ASDF${n}`)
          .attach('file', './test/fixtures/dummy.html')
          .expect(201)
          .expect('Content-Type', /json/);
        });

        return Promise.all(requests);
      })
      .then((ress) => handoutIds = ress.map(_.property('body._id')))
      .then(done.bind(null, null), done);
    });

    after((done) => {
      let requests = handoutIds.map((id) => {
        return request
        .delete(`/api/users/${user._id}/handouts/${id}`)
        .set('Authorization', `Bearer ${user.token}`)
        .expect(204);
      });

      Promise.all(requests)
      .then(() => Handout.remove({}))
      .then(done.bind(null, null), done);
    });

    it('should return handouts when query with playlistId', (done) => {
      request
      .get(`/api/users/${user._id}/handouts`)
      .set('Authorization', `Bearer ${user.token}`)
      .query({ playlistId: 'QWER' })
      .expect(200)
      .expect('Content-Type', /json/)
      .then((res) => {
        let props = ['_uploader', 'videoId', 'playlistId', 's3Path', 'fileName'];
        res.body.should.have.instanceof(Array);
        res.body.should.have.length(3);
        res.body[0].should.have.properties(props);
        done();
      })
      .catch(done);
    });

    it('should return empty array when no one equals with query condition', (done) => {
      request
      .get(`/api/users/${user._id}/handouts`)
      .set('Authorization', `Bearer ${user.token}`)
      .query({ playlistId: 'IAMNOTTHERE' })
      .expect(404)
      .expect('Content-Type', /json/)
      .then((res) => {
        res.body.message.should.match(/no/);
        done();
      })
      .catch(done);
    });
  });

  describe('DELETE /api/users/:id/handouts/:uid', () => {
    let handoutId;

    beforeEach((done) => {
      Handout.remove({})
      .then(() => {
        return request
        .post(`/api/users/${user._id}/handouts`)
        .set('Authorization', `Bearer ${user.token}`)
        .field('playlistId', 'QWER')
        .field('videoId', `ASDF`)
        .attach('file', './test/fixtures/dummy.html')
        .expect(201)
        .expect('Content-Type', /json/);
      })
      .then((res) => handoutId = res.body._id)
      .then(done.bind(null, null), done);
    });

    after((done) => {
      Handout.remove({})
      .then(done.bind(null, null), done);
    });

    it('should return 204 when handout resource is removed', (done) => {
      request
      .delete(`/api/users/${user._id}/handouts/${handoutId}`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(204)
      .then(done.bind(null, null))
      .catch(done);
    });
  });
});

