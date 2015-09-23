'use strict';

var express = require('express');
var controller = require('./lecture.controller');

var router = express.Router({ mergeParams: true });

router.get('/:vid/get-handout', controller.getHandout);

module.exports = router;
