'use strict';

var should = require('should');
var mongoose = require('mongoose');
var Handout = require('../../../models/handout.model');
var User = require('../../../models/user.model');
var app = require('../../../app');
var request = require('supertest-as-promised').agent(app);

mongoose.Promise = Promise;

describe('REST API:', function () {
  var id;

  before(function (done) {
    Promise.all([
      User.remove({}),
      Handout.remove({})
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
    before((done) => {
      var handouts = [{
        videoId: 'miUYEpXDitc',
        fileName: 'just.txt',
        url: 'https://s3.amazonaws.com/learntubebucket/learntubebot01%40gmail.com/handouts/dummytxt'
      }, {
        videoId: 'F-xd3G0PW0k',
        fileName: 'just.pdf',
        url: 'https://s3.amazonaws.com/learntubebucket/learntubebot01%40gmail.com/handouts/dummypdf'
      }].map((el) => {
        el._uploader = id;
        el.playlistId = 'PLReOOCELOIi93J42_bOw_Fe-zMpLxKUMx';
        return el;
      });

      Handout.create(handouts)
      .then(done.bind(null, null), done);
    });

    after((done) => {
      Handout.remove({})
      .then(done.bind(null, null), done);
    });

    it('should return a file which will be downloaded', (done) => {
      request
      .get('/api/classes/PLReOOCELOIi93J42_bOw_Fe-zMpLxKUMx/lectures/F-xd3G0PW0k/get-handout')
      .expect(200)
      .expect('Content-Type', /application\/octet-stream/)
      .then(function (res) {
        should.exist(res.header['content-disposition']);
        res.header['content-disposition'].should.match(/^attachment/);
        done();
      })
      .catch(done);
    });
  });
});
