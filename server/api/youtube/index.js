'use strict';

var express = require('express');
var router = express.Router();

router.use('/uploaded', require('./uploaded'));

module.exports = router;
