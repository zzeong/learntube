'use strict';

var express = require('express');
var controller = require('./note.controller');
var multipart = require('connect-multiparty');

var router = express.Router({ mergeParams: true });

router.get('/', controller.index);
router.get('/:nid', controller.show);
router.get('/:nid/get-contents', controller.getContents);
router.post('/', multipart(), controller.create);
router.put('/:nid', multipart(), controller.update);
router.patch('/:nid', controller.update);
router.delete('/:nid', controller.destroy);

module.exports = router;
