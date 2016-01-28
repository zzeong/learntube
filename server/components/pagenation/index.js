'use strict';

const config = require('../../config/environment');

function isNextValid(skip, count, extraConditionFn) {
  let isNotOverflow = skip + config.google.maxResults < count;
  return isNotOverflow && extraConditionFn();
}

function toSkip(page) {
  page = page || 1;
  return (page - 1) * config.google.maxResults;
}

exports.isNextValid = isNextValid;
exports.toSkip = toSkip;
