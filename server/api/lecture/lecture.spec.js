'use strict';

require('should');
const mongoose = require('mongoose');
const fs = require('fs');
const Handout = require('../../models/handout.model');
const User = require('../../models/user.model');
const app = require('../../app');
const auth = require('../../auth/auth.service');
const request = require('supertest-as-promised').agent(app);

mongoose.Promise = Promise;

describe('REST API:', function () {
  let user;

  before((done) => {
    Promise.all([
      User.remove({}),
      Handout.remove({})
    ])
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

  after(function (done) {
    Promise.all([
      User.remove({}),
      Handout.remove({})
    ])
    .then(done.bind(null, null), done);
  });

  describe('GET /api/classes/:pid/lectures/:vid/get-handout', () => {
    let handoutId;
    let filePath = './test/fixtures/dummy.pdf';

    before((done) => {
      Handout.remove({})
      .then(() => {
        return request
        .post(`/api/users/${user._id}/handouts`)
        .set('Authorization', `Bearer ${user.token}`)
        .field('playlistId', 'QWER')
        .field('videoId', 'ASDF')
        .attach('file', filePath)
        .expect(201)
        .expect('Content-Type', /json/);
      })
      .then((res) => handoutId = res.body._id)
      .then(done.bind(null, null), done);
    });

    after((done) => {
      request
      .delete(`/api/users/${user._id}/handouts/${handoutId}`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(204)
      .then(() => Handout.remove({}))
      .then(done.bind(null, null, done));
    });

    it('should return a file which will be downloaded', (done) => {
      request
      .get('/api/lectures/get-handout')
      .query({
        playlistId: 'QWER',
        videoId: 'ASDF'
      })
      .expect(200)
      .expect('Content-Type', /pdf/)
      .then((res) => {
        res.header.should.have.property('content-disposition');
        res.header['content-disposition'].should.match(/^attachment/);
        fs.stat(filePath, (err, stats) => {
          res.header['content-length'].should.equal(stats.size.toString());
          done();
        });
      })
      .catch(done);
    });
  });
});
