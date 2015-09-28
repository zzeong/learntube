'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var User = require('../user/user.model');

describe('REST API:', function () {
  before(function (done) {
    User.remove({})
    .then(function () {
      var user = {
        name: 'Fake User',
        email: 'test@test.com',
        password: 'password'
      };

      return User.create(user);
    })
    .then(function () { done(); })
    .catch(function (err) { done(err); });
  });

  after(function (done) {
    User.remove({}).then(function () { done(); });
  });


  describe('GET /api/s3/credential', function () {
    var token;

    before(function (done) {
      request(app)
      .post('/auth/local')
      .send({
        email: 'test@test.com',
        password: 'password'
      })
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        token = res.body.token;
        done();
      });
    });

    it('should return S3 credentials', function (done) {
      request(app)
      .get('/api/s3/credential')
      .set('authorization', 'Bearer ' + token)
      .query({
        fileName: 'foo.json',
        fileType: 'application/json',
      })
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) { return done(err); }
        res.body.should.have.property('signedUrl');
        res.body.should.have.property('accessUrl');
        res.body.signedUrl.should.have.containEql(encodeURIComponent('test@test.com'));
        res.body.accessUrl.should.have.containEql('https://');
        done();
      });
    });
  });
});
