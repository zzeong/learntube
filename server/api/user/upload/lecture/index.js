'use strict';

var express = require('express');
var controller = require('./lecture.controller.js');

var router = express.Router({ mergeParams: true });

router.delete('/:lid', controller.destroy);

module.exports = router;
