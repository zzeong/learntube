'use strict';

var express = require('express');
var controller = require('./lecture.controller');

var router = express.Router({ mergeParams: true });

router.post('/', controller.create);

module.exports = router;
