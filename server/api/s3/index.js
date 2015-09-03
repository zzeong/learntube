'use strict';

var express = require('express');
var controller = require('./s3.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/credential', auth.isAuthenticated(), controller.credential);

module.exports = router;
