'use strict';

require('should');
var app = require('../../../../app');
var request = require('supertest-as-promised').agent(app);
var mongoose = require('mongoose');
var auth = require('../../../../auth/auth.service');
var User = require('../../../../models/user.model');
var Upload = require('../../../../models/upload.model');
var config = require('../../../../config/environment');
var knox = require('knox');

mongoose.Promise = Promise;

describe('REST API:', function () {
  var user;

  before(function (done) {
    Promise.all([
      User.remove({}),
      Upload.remove({})
    ])
    .then(function () {
      user = new User({
        name: 'Fake User',
        email: 'test@test.com',
        password: 'password'
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
      Upload.remove({})
    ])
    .then(done.bind(null, null), done);
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
              userId: user._id,
              playlistId: 'PL34d',
              lectures: [{
                videoId: 'ASDF',
                url: request.url
              }]
            });

            upload.save()
            .then(done.bind(null, null), done);
          }
        });

        request.end(string);
      })
      .catch(done);
    });

    afterEach(function (done) {
      Upload.remove({})
      .then(done.bind(null, null), done);
    });

    it('should return 204 when lecture sub-doc is removed', function (done) {
      request
      .delete('/api/users/' + user._id + '/uploads/' + upload._id + '/lectures/' + upload.lectures[0]._id)
      .set('Authorization', 'Bearer ' + user.token)
      .expect(204)
      .then(done.bind(null, null), done);
    });
  });
});

