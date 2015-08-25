'use strict';

var express = require('express');
var router = express.Router();

router.use('/lecture-list', require('./lecture-list'));
router.use('/uploaded', require('./uploaded'));
router.use('/classes', require('./classes'));

module.exports = router;
