'use strict';

require('should');
var app = require('../../../app');
var request = require('supertest-as-promised').agent(app);
var mongoose = require('mongoose');
var auth = require('../../../auth/auth.service');
var User = require('../../../models/user.model');
var Upload = require('../../../models/upload.model');
var config = require('../../../config/environment');
var knox = require('knox');

mongoose.Promise = Promise;


describe('REST API:', () => {
  var user;

  before((done) => {
    User.remove({})
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

  after((done) => {
    User.remove({})
    .then(done.bind(null, null), done);
  });

  describe('POST /api/users/:id/uploads', () => {
    beforeEach((done) => {
      Upload.remove({})
      .then(done.bind(null, null), done);
    });

    afterEach((done) => {
      Upload.remove({})
      .then(done.bind(null, null), done);
    });

    it('should return created \'upload model doc\'', (done) => {
      var params = {
        videoId: 'ASDF',
        playlistId: 'QWER',
        url: 'http://foo.com',
        fileName: 'foo.txt',
      };

      request
      .post('/api/users/' + user._id + '/uploads')
      .set('Authorization', 'Bearer ' + user.token)
      .send(params)
      .expect(201)
      .expect('Content-Type', /json/)
      .then((res) => {
        res.body.should.have.properties(Object.keys(params));
        done();
      })
      .catch(done);
    });
  });


  describe('GET /api/users/:id/uploads', () => {
    beforeEach((done) => {
      Upload.remove({})
      .then(() => {
        var requests = [0, 1, 2].map((n) => {
          return request
          .post('/api/users/' + user._id + '/uploads')
          .set('Authorization', 'Bearer ' + user.token)
          .send({
            videoId: 'ASDF' + n,
            playlistId: 'QWER',
            url: 'http://foo.com',
            fileName: 'foo' + n + '.txt',
          })
          .expect(201)
          .expect('Content-Type', /json/);
        });

        return Promise.all(requests);
      })
      .then(done.bind(null, null), done);
    });

    afterEach((done) => {
      Upload.remove({})
      .then(done.bind(null, null), done);
    });

    it('should return uploads when query with playlistId', (done) => {
      request
      .get('/api/users/' + user._id + '/uploads')
      .set('Authorization', 'Bearer ' + user.token)
      .query({ playlistId: 'QWER' })
      .expect(200)
      .expect('Content-Type', /json/)
      .then((res) => {
        res.body.should.have.instanceof(Array);
        res.body.should.have.length(3);
        res.body[0].should.have.properties(['videoId', 'playlistId', 'url', 'fileName']);
        done();
      })
      .catch(done);
    });

    it('should return empty array when no one equals with query condition', (done) => {
      request
      .get('/api/users/' + user._id + '/uploads')
      .set('Authorization', 'Bearer ' + user.token)
      .query({ playlistId: 'IAMNOTTHERE' })
      .expect(200)
      .expect('Content-Type', /json/)
      .then((res) => {
        res.body.should.have.instanceof(Array);
        res.body.should.have.length(0);
        done();
      })
      .catch(done);
    });
  });

  describe('DELETE /api/users/:id/uploads/:uid', () => {
    var upload;

    beforeEach((done) => {
      var awsClient = knox.createClient({
        key: config.aws.accessKeyId,
        secret: config.aws.secretKey,
        bucket: config.aws.s3Bucket
      });

      Upload.remove({})
      .then(function () {
        var string = 'hello';
        var fileName = 'foo.txt';

        var req = awsClient.put('/' + user.email + '/' + fileName, {
          'x-amz-acl': 'private',
          'Content-Length': Buffer.byteLength(string),
          'Content-Type': 'text/plain'
        });

        req.on('response', function (res) {
          if (200 === +res.statusCode) {
            upload = new Upload({
              userId: user._id,
              playlistId: 'PL34d',
              videoId: 'ASDF0',
              url: req.url,
              fileName: fileName,
            });

            upload.save()
            .then(done.bind(null, null), done);
          }
        })
        .end(string);
      })
      .catch(done);
    });

    it('should return 204 when upload resource is removed', (done) => {
      Upload.findOne({ videoId: 'ASDF0' }).exec()
      .then((upload) => {
        return request
        .delete('/api/users/' + user._id + '/uploads/' + upload._id)
        .set('Authorization', 'Bearer ' + user.token)
        .expect(204);
      })
      .then(done.bind(null, null))
      .catch(done);
    });
  });
});

