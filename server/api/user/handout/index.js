'use strict';

var express = require('express');
var controller = require('./handout.controller');
var multipart = require('connect-multiparty');

var router = express.Router({ mergeParams: true });

router.get('/', controller.index);
router.post('/', multipart(), controller.create);
router.delete('/:hid', controller.destroy);

module.exports = router;
