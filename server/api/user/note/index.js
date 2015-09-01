'use strict';

var express = require('express');
var controller = require('./note.controller');

var router = express.Router({ mergeParams: true });

router.get('/', controller.index);
router.get('/meta', controller.meta);
router.get('/:nid', controller.show);
router.post('/', controller.create);
router.put('/:nid', controller.update);
router.patch('/:nid', controller.update);
router.delete('/:nid', controller.destroy);

module.exports = router;
