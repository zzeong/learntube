'use strict';

var express = require('express');
var controller = require('./class.controller');

var router = express.Router();

router.use('/:pid/lectures', require('./lecture'));

router.get('/get-tops', controller.getTops);

module.exports = router;
