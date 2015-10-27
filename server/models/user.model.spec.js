'use strict';

var should = require('should');
var User = require('./user.model');

require('mongoose').Promise = require('promise');

var user = new User({
  name: 'Fake User',
  email: 'test@test.com',
  password: 'password'
});

describe('User Model', function () {
  before(function (done) {
    User.remove({}).then(function () { done(); });
  });

  afterEach(function (done) {
    User.remove({}).then(function () { done(); });
  });

  it('should begin with no users', function (done) {
    User.find({})
    .then(function (users) {
      users.should.have.length(0);
      done();
    })
    .catch(function (err) { done(err); });
  });

  it('should fail when saving a duplicate user', function (done) {
    user.save(function () {
      var userDup = new User(user);
      userDup.save()
      .catch(function (err) {
        should.exist(err);
        done();
      });
    });
  });

  it('should fail when saving without an email', function (done) {
    user.email = '';
    user.save()
    .catch(function (err) {
      should.exist(err);
      done();
    });
  });

  it('should authenticate user if password is valid', function () {
    return user.authenticate('password').should.be.true;
  });

  it('should not authenticate user if password is invalid', function () {
    return user.authenticate('blah').should.not.be.true;
  });
});
