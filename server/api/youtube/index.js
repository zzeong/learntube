'use strict';

var express = require('express');
var router = express.Router();
var auth = require('../../auth/auth.service');
var g = require('../../components/google-api');

router.use('/mine', auth.isAuthenticated(), g.setCredentials);

router.use('/mine/playlists', require('./mine/playlist'));
router.use('/mine/playlistitems', require('./mine/playlistitem'));
router.use('/mine/videos', require('./mine/video'));

module.exports = router;
