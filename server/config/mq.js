'use strict';

const User = require('../models/user.model');

module.exports = function (ctx) {
  ctx.on('ready', () => {
    var pub = ctx.socket('PUB');
    pub.connect('scrap', () => {
      console.log('Connecting publisher..');
      User.schema.post('save', function () {
        pub.write(JSON.stringify(this.toObject()), 'utf8');
      });
    });
  });
};
