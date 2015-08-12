'use strict';

var express = require('express');
var controller = require('./lecture.controller');

var router = express.Router({ mergeParams: true });

router.get('/', controller.index);
router.get('/:lid', controller.show);
router.post('/', controller.create);
router.put('/:lid', controller.update);
router.patch('/:lid', controller.update);
router.delete('/:lid', controller.destroy);

module.exports = router;
