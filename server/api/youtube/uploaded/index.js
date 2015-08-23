'use strict';

var express = require('express');
var controller = require('./uploaded.controller');
var auth = require('../../../auth/auth.service');

var router = express.Router({ mergeParams: true });

router.get('/', auth.isAuthenticated(), controller.index);
router.post('/', auth.isAuthenticated(), controller.insert);
router.delete('/:pid', auth.isAuthenticated(), controller.destroy);

module.exports = router;
