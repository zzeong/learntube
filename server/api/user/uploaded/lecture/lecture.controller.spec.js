'use strict';

var should = require('should');
var app = require('../../../../app');
var request = require('supertest');
var mongoose = require('mongoose');
var User = require('../../user.model');
var Uploaded = require('../uploaded.model');
var config = require('../../../../config/environment');
var knox = require('knox');

describe('REST API:', function() {
  var user;

  before(function(done) {
    User.remove().exec().then(function() {
      user = new User({
        name: 'Fake User',
        email: 'test@test.com',
        password: 'password'
      });

      user.save(function() {
        done();
      });
    });
  });

  after(function(done) {
    User.remove().exec().then(function() {
      done(); 
    });
  });

  describe('DELETE /api/users/:id/uploaded/lectures', function() {
    this.timeout(5000);
    var uploaded;

    beforeEach(function(done) {
      var awsClient = knox.createClient({
        key: config.aws.accessKeyId,
        secret: config.aws.secretKey,
        bucket: config.aws.s3Bucket
      });

      Uploaded.remove().exec().then(function() {
        var string = 'hello';

        var request = awsClient.put('/test/foo.txt', {
          'x-amz-acl': 'private',
          'Content-Length': Buffer.byteLength(string),
          'Content-Type': 'text/plain'
        });
        
        request.on('response', function(res) {
          if(200 === +res.statusCode) {
            uploaded = new Uploaded({
              userId: user._id,
              playlistId: 'PL34d',
              lectures: [{
                videoId: 'ASDF',
                s3Url: request.url
              }]
            });

            uploaded.save(function(err) {
              done();
            });
          }
        });

        request.end(string);
      });
    });

    afterEach(function(done) {
      Uploaded.remove().exec().then(function() {
        done(); 
      });
    });

    it('should return 204 when lecture sub-doc is removed', function(done) {
      request(app)
      .delete('/api/users/' + user._id + '/uploaded/' + uploaded._id + '/lectures/' + uploaded.lectures[0]._id)
      .expect(204)
      .end(function(err, res) {
        if(err) { return done(err); } 
        done();
      });
    });

  });

});

