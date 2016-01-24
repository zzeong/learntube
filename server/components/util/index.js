'use strict';

const crypto = require('crypto');

let utils = {
  getUniqueHash: getUniqueHash
};

function getUniqueHash() {
  var id = crypto.randomBytes(20).toString('hex');
  return crypto.createHash('md5').update(id).digest('hex');
}

module.exports = utils;

