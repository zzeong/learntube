'use strict';

var express = require('express');
var controller = require('./playlist.controller');

var router = express.Router();

router.get('/', controller.index);
router.post('/', controller.create);
router.put('/', controller.update);
router.delete('/', controller.destroy);

module.exports = router;

