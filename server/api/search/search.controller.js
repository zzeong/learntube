'use strict';

const _ = require('lodash');
const g = require('../../components/google-api');
const fetchExtras = require('../../components/youtube-helper').fetchExtras;

let search = g.youtube.bind(null, 'search.list');

function index(req, res, next) {
  let base = { part: 'snippet' };
  search(_.assign(base, req.query))
  .then((res) => {
    return _.isEqual(req.query.type, 'video') ? fetchExtras(res.items) : Promise.resolve(res.items);
  })
  .then((list) => res.status(200).json(list.map(formEntity)))
  .catch(next);
}

exports.index = index;

function formEntity(item) {
  let get = _.get.bind(null, item);
  let entity = {
    title: get('snippet.title'),
    thumbnailUrl: get('snippet.thumbnails.medium.url'),
    channelId: get('snippet.channelId'),
    channelTitle: get('snippet.channelTitle'),
    description: get('snippet.description'),
    publishedAt: get('snippet.publishedAt'),
  };

  setIf(entity, 'contentDetails.duration', 'duration');
  setIf(entity, 'status', 'status');
  setIf(entity, 'statistics', 'stats');
  setIf(entity, 'id.videoId', 'videoId');
  setIf(entity, 'id.playlistId', 'playlistId');

  return entity;

  function setIf(obj, itemPath, objPath) {
    if (get(itemPath)) { _.set(obj, objPath, get(itemPath)); }
  }
}
