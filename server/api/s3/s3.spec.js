'use strict';

require('should');
var app = require('../../app');
var request = require('supertest-as-promised');
var User = require('../../models/user.model');
var auth = require('../../auth/auth.service');

describe('REST API:', function () {
  var id;

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
    .then(function (user) {
      id = user._id;
      done();
    })
    .catch(done);
  });

  after(function (done) {
    User.remove({})
    .then(done.bind(null, null), done);
  });


  describe('GET /api/s3/credential', function () {
    var token;

    before(function () {
      token = auth.signToken(id);
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
      .then(function (res) {
        res.body.should.have.property('signedUrl');
        res.body.should.have.property('accessUrl');
        res.body.signedUrl.should.have.containEql(encodeURIComponent('test@test.com'));
        res.body.accessUrl.should.have.containEql('https://');
        done();
      })
      .catch(done);
    });
  });
});
