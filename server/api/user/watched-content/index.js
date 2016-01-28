'use strict';

var express = require('express');
var controller = require('./watched-content.controller');
var service = require('./watched-content.service');
var g = require('../../../components/google-api');

var router = express.Router({ mergeParams: true });

router.use('/', g.readyApi);
router.use('/:cid/lectures', require('./lecture'));

router.get('/', service.validateSkip, controller.index);
router.get('/:cid', controller.show);
router.post('/', controller.create);
router.delete('/:cid', controller.destroy);

module.exports = router;
