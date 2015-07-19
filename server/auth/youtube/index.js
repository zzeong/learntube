'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');

var router = express.Router();

router
  .get('/', passport.authenticate('youtube', {
    failureRedirect: '/signup',
    scope: [
      'https://www.googleapis.com/auth/youtube',
    ],
    session: false
  }))

  .get('/callback', passport.authenticate('youtube', {
    failureRedirect: '/signup',
    session: false
  }), auth.setTokenCookie);

module.exports = router;
