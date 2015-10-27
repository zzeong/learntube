'use strict';

var express = require('express');
var config = require('../config/environment');
var User = require('../models/user.model');

// Passport Configuration
require('./google/passport').setup(User, config);

var router = express.Router();

router.use('/google', require('./google'));

module.exports = router;
