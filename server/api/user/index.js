'use strict';

var express = require('express');
var controller = require('./user.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.use('/:id', auth.isAuthenticated());

router.use('/:id/watched-contents', require('./watched-content'));
router.use('/:id/notes', require('./note'));
router.use('/:id/handouts', require('./handout'));

router.get('/', auth.hasRole('admin'), controller.index);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/me', controller.me);
router.put('/:id/password', controller.changePassword);
router.get('/:id', controller.show);


module.exports = router;
