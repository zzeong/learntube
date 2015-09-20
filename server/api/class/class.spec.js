'use strict';

var _ = require('lodash');
var should = require('should');
var request = require('supertest');
var Rating = require('../rating/rating.model.js');
var app = require('../../app');

describe('REST API:', function() {
  before(function(done) {
    var arr = _.range(10).map(function(e, i) {
      return {
        playlistId: 'ASDF' + i,
        points: Math.floor(Math.random() * 100) + 1
      }; 
    });

    Rating.remove()
    .then(function() {
      return Rating.create(arr);
    })
    .then(function() { done(); });
  });

  after(function(done) {
    Rating.remove().exec().then(function() {
      done(); 
    }); 
  });
  
  describe('GET /api/classes/get-tops', function() {
    it('should return rating docs which are limited in number', function(done) {
      request(app)
      .get('/api/classes/get-tops')
      .query({ num: 6 })
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if(err) { return done(err); } 

        res.body.should.length(6);
        done();
      });
    }); 

    it('should return sorted docs', function(done) {
      request(app)
      .get('/api/classes/get-tops')
      .query({ num: 6 })
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if(err) { return done(err); } 

        res.body.reduce(function(p, c) {
          p.points.should.be.aboveOrEqual(c.points);
          return c;
        });
        done();
      });
    });
  });
});
