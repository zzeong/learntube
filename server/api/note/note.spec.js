'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');

var User = require('../user/user.model');

var user = new User({
  provider: 'local',
  name: 'Fake User',
  email: 'test@test.com',
  password: 'password',
  notes: []
});

var note = {
  videoId: 'sMKoNBRZM1M',
  hash: 'd41d8cd98f00b204e9800998ecf8427e',
  url: 'https://s3.amazonaws.com/learntubebucket/test@test.com/d41d8cd98f00b204e9800998ecf8427e',
};

describe('Note sub-docs in User Model', function() {
  before(function(done) {
    User.remove().exec();
    user.save(function() { done(); });
  });


  it('should begin with no notes', function(done) {
    User.findOne(user, function(err, findedUser) {
      findedUser.notes.should.be.instanceof(Array);
      findedUser.notes.should.have.length(0);
      done();
    });
  });

  it('should have just one note', function(done) {
    User.findOne(user, function(err, findedUser) {
      findedUser.notes.push(note);
      findedUser.notes.should.have.length(1); 
      findedUser.save(function (err) {
        if(err) { return handleError(res, err); }
        done();
      });
    });
  });
});
