'use strict';

var express = require('express');
var controller = require('./category.controller');

var router = express.Router();

router.get('/get-each-top', controller.getEachTop);
router.get('/', controller.index);

module.exports = router;
