'use strict';

var express = require('express');
var controller = require('./class.controller');

var router = express.Router({ mergeParams: true });

router.use('/:cid/lectures', require('./lecture'));

router.get('/', controller.index);
router.post('/', controller.create);
router.delete('/:cid', controller.destroy);

module.exports = router;
