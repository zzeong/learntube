'use strict';

var express = require('express');
var controller = require('./class.controller');
var auth = require('../../auth/auth.service');
var g = require('../../components/google-api');

var router = express.Router();

router.use('/', auth.getValidatedUser(), g.readyApi);
router.use('/:pid/lectures', require('./lecture'));

router.get('/', controller.index);
router.post('/', controller.create);
router.put('/:cid', controller.update);
router.delete('/:cid', controller.destroy);
router.get('/get-tops', controller.getTops);
router.get('/get-each-category', controller.getEachCategory);

module.exports = router;
