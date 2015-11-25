'use strict';

require('should');
var request = require('supertest-as-promised');
var Class = require('../../models/class.model');
var app = require('../../app.js');
var seeder = require('../../config/seed');

describe('REST API:', function () {
  before(function (done) {
    Class.remove({})
    .then(done.bind(null, null))
    .catch(done);
  });

  after(function (done) {
    Class.remove({})
    .then(done.bind(null, null))
    .catch(done);
  });

  describe('GET /api/cateogires', function () {
    beforeEach(function (done) {
      Class.remove({})
      .then(function () {
        return seeder.seedClassFromFile('test/fixtures/class.csv');
      })
      .then(done.bind(null, null))
      .catch(done);
    });

    afterEach(function (done) {
      Class.remove({})
      .then(done.bind(null, null))
      .catch(done);
    });

    it('should return sorted and limited classes', function (done) {
      request(app)
      .get('/api/categories')
      .expect(200)
      .expect('Content-Type', /json/)
      .then(function (res) {
        res.body.length.should.equal(40);
        res.body.reduce(function (pre, cur) {
          pre.rate.should.be.aboveOrEqual(cur.rate);
          return cur;
        });
        done();
      })
      .catch(done);
    });

    it('should return classes queried with slug', function (done) {
      request(app)
      .get('/api/categories?slug=HUMA')
      .expect(200)
      .expect('Content-Type', /json/)
      .then(function (res) {
        var filtered = res.body.filter(function (el) {
          return el.categorySlug === 'HUMA';
        });
        filtered.length.should.equal(40);
        done();
      })
      .catch(done);
    });

    it('should return classes having additional property', function (done) {
      request(app)
      .get('/api/categories')
      .expect(200)
      .expect('Content-Type', /json/)
      .then(function (res) {
        res.body.forEach(function (item) {
          item.should.have.property('playlistTitle');
          item.should.have.property('channelTitle');
          item.should.have.property('thumbnailUrl');
        });
        done();
      })
      .catch(done);
    });
  });
});
