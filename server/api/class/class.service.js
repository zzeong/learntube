'use strict';

const _ = require('lodash');
var compose = require('composable-middleware');
const Class = require('../../models/class.model');
const config = require('../../config/environment');
const youtube = require('../../components/google-api').youtube;
const pagenation = require('../../components/pagenation');

let channels = youtube.bind(null, 'channels.list');

require('mongoose').Promise = Promise;

function validateAndextractQuery() {
  return compose()
  .use(validateSkip)
  .use(extractYoutubeQuery);
}

function extractYoutubeQuery(req, res, next) {
  let q = req.q;
  delete req.q;

  if (!req.user && !!q.mine) {
    return next(new Error('Unauthorized'));
  }

  let ytquery = queryFor(q, 'youtube');

  Class.find(queryFor(q, 'db'))
  .sort(_.set({}, q.orderBy || 'rating', -1))
  .skip(pagenation.toSkip(q.page))
  .limit(config.google.maxResults).exec()
  .then((classes) => {
    if (!classes) {
      req.ytquery = ytquery;
      next();
    }

    let id = classes.map(_.property('playlistId'));
    req.ytquery = _.assign(ytquery, { id });
    next();
  })
  .catch(next);
}

function validateSkip(req, res, next) {
  preForMine(req.query)
  .then((q) => {
    return Class.find(queryFor(q, 'db'))
    .count().exec()
    .then((count) => {
      req.q = q;
      if (!count) { return next(); }

      let skip = pagenation.toSkip(q.page);
      if (skip >= count) { return next(new Error('skip has invalid value')); }
      if (pagenation.isNextValid(skip, count, () => !_.has(req.query, 'playlistId'))) {
        req.nextPage = +(_.get(q, 'page', 1)) + 1;
      }

      next();
    });
  })
  .catch(next);

  function preForMine(q) {
    if (q.mine) {
      return channels({ part: 'id', mine: true })
      .then((ytres) => {
        if (!ytres.items.length) {
          return res.status(404).json({ message: 'channelNotFound' });
        }
        return _.assign(q, { channelId: _.first(ytres.items).id });
      });
    }
    return Promise.resolve(q);
  }
}

exports.validateAndextractQuery = validateAndextractQuery;

function queryFor(reqQuery, target) {
  let refinder = {
    db: (q) => {
      let query = {};
      if (q.categorySlug) { query.categorySlug = q.categorySlug; }
      if (q.playlistId) { query.playlistId = q.playlistId; }
      if (q.channelId) { query.channelId = q.channelId; }

      return query;
    },
    youtube: (q) => {
      let query = { part: 'id,snippet,status' };
      if (q.playlistId) { query.id = q.playlistId; }

      return query;
    }
  };
  return refinder[target](reqQuery);
}

