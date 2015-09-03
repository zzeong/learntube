'use strict';

var express = require('express');
var controller = require('./uploaded.controller');

var router = express.Router({ mergeParams: true });

router.get('/', controller.index);
router.post('/', controller.create);

module.exports = router;
