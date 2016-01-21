'use strict';

const _ = require('lodash');
const g = require('../../components/google-api');

let channels = g.youtube.bind(null, 'channels.list');

function index(req, res, next) {
  let base = { part: 'snippet' };
  channels(_.assign(base, { id: req.query.channelId }))
  .then((response) => res.status(200).json(response.items.map(formEntity)))
  .catch(next);
}

exports.index = index;

function formEntity(item) {
  let get = _.get.bind(null, item);
  return {
    thumbnailUrl: get('snippet.thumbnails.medium.url'),
    title: get('snippet.title'),
    description: get('snippet.description')
  };
}
