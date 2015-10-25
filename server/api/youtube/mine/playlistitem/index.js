'use strict';

var express = require('express');
var controller = require('./playlistitem.controller');
var auth = require('../../../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index);
router.post('/', controller.create);
router.delete('/', controller.destroy);

module.exports = router;

