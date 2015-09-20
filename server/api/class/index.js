'use strict';

var express = require('express');
var controller = require('./class.controller');

var router = express.Router();

router.get('/get-tops', controller.getTops);

module.exports = router;
