'use strict';

var express = require('express');
var controller = require('./upload.controller');

var router = express.Router({ mergeParams: true });

router.get('/', controller.index);
router.post('/', controller.create);
router.delete('/:uid', controller.destroy);

module.exports = router;
