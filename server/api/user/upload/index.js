'use strict';

var express = require('express');
var controller = require('./upload.controller');

var router = express.Router({ mergeParams: true });

router.use('/:uid/lectures', require('./lecture'));

router.get('/', controller.index);
router.post('/', controller.create);

module.exports = router;
