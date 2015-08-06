/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var User = require('../api/user/user.model');
var Note = require('../api/user/note/note.model');

User.find({}).remove(function() {
  User.create({
    provider: 'local',
    name: 'Test User',
    email: 'test@test.com',
    password: 'test',
    notes: [{
      videoId: 'sMKoNBRZM1M',
      hash: '7121cd645707ec47efa33393028473c7',
      url: 'https://learntubebucket.s3.amazonaws.com/test@test.com/7121cd645707ec47efa33393028473c7',
      s3Path: '/test@test.com/7121cd645707ec47efa33393028473c7',
    }]
  }, {
    provider: 'local',
    role: 'admin',
    name: 'Admin',
    email: 'admin@admin.com',
    password: 'admin'
  }, function() {
      console.log('finished populating users');
    }
  );
});
