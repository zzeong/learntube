'use strict';

var should = require('should');
var app = require('../../../app');
var request = require('supertest');

describe('REST API:', function() {
  this.timeout(5000);

  describe('GET /api/youtube/lecture-list', function() {
    it('should return object that is gotten from YouTube API', function(done) {
      request(app)
      .get('/api/youtube/lecture-list/')
      .query({
        max: 30,
        playlistId: 'PL9cwsTrgI6FFxBon4flET37aW2QJP7l9S',
      })
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if(err) { return done(err); } 
        res.body.should.be.instanceof(Array);
        res.body[0].should.have.property('snippet');
        res.body[0].should.have.property('status');
        res.body[0].should.have.property('contentDetails');
        done();
      });
    });  
  });
});
