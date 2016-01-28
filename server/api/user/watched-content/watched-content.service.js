'use strict';

const _ = require('lodash');
const WatCtt = require('../../../models/watched-content.model');
const pagenation = require('../../../components/pagenation');

function validateSkip(req, res, next) {
  WatCtt.find({ _watcher: req.params.id })
  .count().exec()
  .then((count) => {
    if (!count) { return next(); }

    let skip = pagenation.toSkip(req.query.page);
    if (skip >= count) { return next(new Error('skip has invalid value')); }
    if (pagenation.isNextValid(skip, count, () => !_.has(req.query, 'playlistId'))) {
      req.nextPage = +(_.get(req.query, 'page', 1)) + 1;
    }

    next();
  });
}

exports.validateSkip = validateSkip;
