'use strict';

require('should');
var _ = require('lodash');
var Rating = require('../../models/rating.model');
var app = require('../../app.js');
var request = require('supertest-as-promised').agent(app);

describe('REST API:', function () {
  before(function (done) {
    var arr = _.range(10).map(function (e, i) {
      return {
        playlistId: 'ASDF' + i,
        points: Math.floor(Math.random() * 100) + 1
      };
    });

    Rating.remove({})
    .then(function () {
      return Rating.create(arr);
    })
    .then(done.bind(null, null))
    .catch(done);
  });

  after(function (done) {
    Rating.remove({})
    .then(done.bind(null, null), done);
  });

  describe('GET /api/classes/get-tops', function () {
    it('should return rating docs which are limited in number', function (done) {
      request
      .get('/api/classes/get-tops')
      .query({ num: 6 })
      .expect(200)
      .expect('Content-Type', /json/)
      .then(function (res) {
        res.body.should.length(6);
        done();
      })
      .catch(done);
    });

    it('should return sorted docs', function (done) {
      request
      .get('/api/classes/get-tops')
      .query({ num: 6 })
      .expect(200)
      .expect('Content-Type', /json/)
      .then(function (res) {
        res.body.reduce(function (p, c) {
          p.points.should.be.aboveOrEqual(c.points);
          return c;
        });
        done();
      })
      .catch(done);
    });
  });
});
