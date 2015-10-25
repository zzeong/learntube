'use strict';

var express = require('express');
var router = express.Router();
var auth = require('../../auth/auth.service');

router.use('/mine', auth.isAuthenticated());

router.use('/mine/playlists', require('./mine/playlist'));
router.use('/mine/playlistitems', require('./mine/playlistitem'));
router.use('/mine/videos', require('./mine/video'));

module.exports = router;
