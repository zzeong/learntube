'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');

var router = express.Router();

router
.get('/', passport.authenticate('google', {
  failureRedirect: '/signup',
  scope: [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/youtube',
    'https://www.googleapis.com/auth/youtube.upload'
  ],
  accessType: 'offline',
  approvalPrompt: (process.env.NODE_ENV === 'development' ? 'force' : 'auto'),
  session: false
}))

.get('/callback', passport.authenticate('google', {
  failureRedirect: '/signup',
  session: false
}), auth.setTokenCookie);

module.exports = router;
