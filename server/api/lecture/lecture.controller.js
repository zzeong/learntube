'use strict';

const g = require('../../components/google-api');
const _ = require('lodash');

let videos = { list: g.youtube.bind(null, 'videos.list') };
let channels = { list: g.youtube.bind(null, 'channels.list') };
let playlistItems = {
  list: g.youtube.bind(null, 'playlistItems.list'),
  insert: g.youtube.bind(null, 'playlistItems.insert'),
  update: g.youtube.bind(null, 'playlistItems.update'),
  delete: g.youtube.bind(null, 'playlistItems.delete'),
};

function index(req, res, next) {
  let base = { part: 'id,snippet,status' };
  playlistItems.list(_.assign(base, req.query))
  .then((res) => fetchExtras(res.items))
  .then((lectures) => res.status(200).json(lectures.map(formEntity)))
  .catch(next);
}

function create(req, res, next) {
  let base = { part: 'snippet,status' };
  playlistItems.insert(_.assign(base, { resource: formResource(req.body)}))
  .then(fetchExtras)
  .then((lectures) => res.status(201).json(_.first(lectures.map(formEntity))))
  .catch(next);
}

function destroy(req, res, next) {
  let videoIds = req.query.videoId.split(',');
  videoIds.reduce((promise, curId) => {
    return promise.then(() => {
      let params = _.pick(req.query, 'playlistId');
      return findId(_.assign(params, { videoId: curId }));
    })
    .then((id) => playlistItems.delete({ id }));
  }, Promise.resolve())
  .then(() => res.status(204).json())
  .catch(next);
}

function mine(req, res, next) {
  channels.list({
    part: 'contentDetails',
    mine: true,
    fields: 'items(contentDetails)',
  })
  .then((res) => {
    let params = {
      part: 'id,snippet,status',
      playlistId: _.first(res.items).contentDetails.relatedPlaylists.uploads,
    };
    return playlistItems.list(params);
  })
  .then((res) => fetchExtras(res.items))
  .then((lectures) => res.status(200).json(lectures.map(formEntity)))
  .catch(next);
}

exports.index = index;
exports.create = create;
exports.destroy = destroy;

exports.mine = mine;

function fetchExtras(list) {
  if (!list.length) { list = [list]; }

  let base = {
    part: 'id,contentDetails,status,statistics',
    fields: 'items(id,contentDetails(duration),status(uploadStatus,rejectionReason,privacyStatus),statistics)',
  };
  let ids = list.map(_.property('snippet.resourceId.videoId'));

  return videos.list(_.assign(base, { id: ids }))
  .then((res) => {
    let obj = _.keyBy(res.items, 'id');
    return list.map((item) => {
      let videoId = item.snippet.resourceId.videoId;
      return _.assign(item, _.omit(obj[videoId], 'id'));
    });
  });
}

function formEntity(item) {
  let get = _.get.bind(null, item);
  return {
    title: get('snippet.title'),
    duration: get('contentDetails.duration'),
    status: get('status'),
    stats: get('statistics'),
    thumbnailUrl: get('snippet.thumbnails.medium.url'),
    channelId: get('snippet.channelId'),
    channelTitle: get('snippet.channelTitle'),
    description: get('snippet.description'),
    playlistId: get('snippet.playlistId'),
    playlistItemId: get('id'),
    videoId: get('snippet.resourceId.videoId'),
    publishedAt: get('snippet.publishedAt'),
  };
}

function formResource(d) {
  let get = _.get.bind(null, d);
  return {
    snippet: {
      playlistId: get('playlistId'),
      resourceId: {
        kind: 'youtube#video',
        videoId: get('videoId')
      }
    }
  };
}

function findId(p) {
  let base = { part: 'id' };
  return playlistItems.list(_.assign(base, p))
  .then(_.property('items[0].id'));
}

