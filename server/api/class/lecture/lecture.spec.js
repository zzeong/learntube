'use strict';

var _ = require('lodash');
var should = require('should');
var request = require('supertest');
var mongoose = require('mongoose');
var Upload = require('../../../models/upload.model');
var User = require('../../../models/user.model');
var app = require('../../../app');

var Promise = mongoose.Promise = require('promise');


describe('REST API:', function () {
  var id;

  before(function (done) {
    Promise.all([
      User.remove({}),
      Upload.remove({})
    ])
    .then(function () {
      var user = {
        name: 'Fake User',
        email: 'test@test.com',
        password: 'password',
      };
      return User.create(user);
    })
    .then(function (user) {
      id = user._id;
      done();
    })
    .catch(function (err) { done(err); });
  });

  after(function (done) {
    Promise.all([
      User.remove({}),
      Upload.remove({})
    ])
    .then(function () { done(); })
    .catch(function (err) { done(err); });
  });


  describe('GET /api/classes/:pid/lectures/:vid/get-handout', function () {
    before(function (done) {
      Upload.create([{
        userId: id,
        playlistId: 'PLReOOCELOIi93J42_bOw_Fe-zMpLxKUMx',
        lectures: [{
          videoId: 'miUYEpXDitc',
          fileName: 'just.txt',
          url: 'https://s3.amazonaws.com/learntubebucket/learntubebot01%40gmail.com/uploads/24ebf6590e230c823d1afd1dd01911e2'
        }, {
          videoId: 'F-xd3G0PW0k',
          fileName: 'just.pdf',
          url: 'https://s3.amazonaws.com/learntubebucket/learntubebot01%40gmail.com/uploads/2bd6387e8333e63dec3e1cea9617accb'
        }],
      }])
      .then(function () { done(); })
      .catch(function (err) { done(err); });
    });


    it('should return a file which will be downloaded', function (done) {
      request(app)
      .get('/api/classes/PLReOOCELOIi93J42_bOw_Fe-zMpLxKUMx/lectures/F-xd3G0PW0k/get-handout')
      .expect(200)
      .expect('Content-Type', /application\/octet-stream/)
      .end(function (err, res) {
        if (err) { return done(err); }
        should.exist(res.header['content-disposition']);
        res.header['content-disposition'].should.match(/^attachment/);
        done();
      });
    });
  });
});
