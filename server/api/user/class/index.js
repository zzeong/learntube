'use strict';

var express = require('express');
var controller = require('./class.controller');

var router = express.Router({ mergeParams: true});

router.use('/:cid/lectures', require('./lecture'));

router.get('/', controller.index);
router.get('/:cid', controller.show);
router.post('/', controller.create);
router.put('/:cid', controller.update);
router.patch('/:cid', controller.update);
router.delete('/:cid', controller.destroy);

module.exports = router;
