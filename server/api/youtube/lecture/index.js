'use strict';

var express = require('express');
var controller = require('./lecture.controller');
var auth = require('../../../auth/auth.service');

var router = express.Router({ mergeParams: true });

router.post('/', auth.isAuthenticated(), controller.create);

module.exports = router;
