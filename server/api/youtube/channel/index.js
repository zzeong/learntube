'use strict';

var express = require('express');
var controller = require('./channel.controller');
var auth = require('../../../auth/auth.service');

var router = express.Router({ mergeParams: true });

router.get('/', auth.isAuthenticated(), controller.index);

module.exports = router;

