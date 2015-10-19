'use strict';

var should = require('should');
var app = require('../../../../app');
var request = require('supertest');
var mongoose = require('mongoose');
var User = require('../../../../models/user.model');
var Upload = require('../../../../models/upload.model');
var config = require('../../../../config/environment');
var knox = require('knox');

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
        password: 'password'
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

  describe('DELETE /api/users/:id/uploads/lectures', function () {
    var upload;

    beforeEach(function (done) {
      var awsClient = knox.createClient({
        key: config.aws.accessKeyId,
        secret: config.aws.secretKey,
        bucket: config.aws.s3Bucket
      });

      Upload.remove({})
      .then(function () {
        var string = 'hello';

        var request = awsClient.put('/test/foo.txt', {
          'x-amz-acl': 'private',
          'Content-Length': Buffer.byteLength(string),
          'Content-Type': 'text/plain'
        });

        request.on('response', function (res) {
          if (200 === +res.statusCode) {
            upload = new Upload({
              userId: id,
              playlistId: 'PL34d',
              lectures: [{
                videoId: 'ASDF',
                url: request.url
              }]
            });

            upload.save(function (err) {
              done();
            });
          }
        });

        request.end(string);
      });
    });

    afterEach(function (done) {
      Upload.remove({}).then(function () { done(); });
    });

    it('should return 204 when lecture sub-doc is removed', function (done) {
      request(app)
      .delete('/api/users/' + id + '/uploads/' + upload._id + '/lectures/' + upload.lectures[0]._id)
      .expect(204)
      .end(function (err, res) {
        if (err) { return done(err); }
        done();
      });
    });

  });

});

