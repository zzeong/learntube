'use strict';

var express = require('express');
var controller = require('./lecture.controller');
var auth = require('../../auth/auth.service');
var g = require('../../components/google-api');

var router = express.Router();

router.use('/', auth.getValidatedUser(), g.readyApi);

router.get('/', controller.index);
router.post('/', controller.create);
router.delete('/', controller.destroy);

router.get('/mine', controller.mine);

module.exports = router;
