'use strict';

var express = require('express');
var controller = require('./user.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.use('/:id', auth.isAuthenticated());

router.use('/:id/classes', require('./class'));
router.use('/:id/notes', require('./note'));
router.use('/:id/uploads', require('./upload'));

router.get('/', auth.hasRole('admin'), controller.index);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.me);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.get('/:id', auth.isAuthenticated(), controller.show);


module.exports = router;
