'use strict';

const _ = require('lodash');
const fs = require('fs');
const g = require('../../components/google-api');
const s3 = require('../../components/s3');
const fetchExtras = require('../../components/youtube-helper').fetchExtras;
const Handout = require('../../models/handout.model');

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
  .then((lectures) => Promise.all(lectures.map(formEntity).map(addPropsAsync)))
  .then((lectures) => res.status(200).json(lectures))
  .catch(next);
}

function create(req, res, next) {
  let base = { part: 'snippet,status' };
  playlistItems.insert(_.assign(base, { resource: formResource(req.body)}))
  .then(fetchExtras)
  .then((lectures) => Promise.all(lectures.map(formEntity).map(addPropsAsync)))
  .then((lectures) => res.status(201).json(_.first(lectures)))
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
  .then((lectures) => Promise.all(lectures.map(formEntity).map(addPropsAsync)))
  .then((lectures) => res.status(200).json(lectures))
  .catch(next);
}

function getHandout(req, res, next) {
  let query = _.pick(req.query, ['playlistId', 'videoId']);

  Handout.findOne(query).exec()
  .then((handout) => {
    if (!handout) { return res.status(404).json({ message: 'no resource' }); }

    let filePath = './' + handout.fileName;
    let ws = fs.createWriteStream(filePath);


    return s3.getFile(handout.s3Path)
    .then((s3res) => {
      res.setHeader('Content-Type', s3res.headers['content-type']);
      res.setHeader('Content-Disposition', `attachment; filename=${handout.fileName}`);
      res.setHeader('Content-Length', s3res.headers['content-length']);

      s3res.pipe(ws);
      s3res.on('end', streamFile(res, filePath));
    });
  })
  .catch(next);
}

exports.index = index;
exports.create = create;
exports.destroy = destroy;

exports.mine = mine;
exports.getHandout = getHandout;

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

function removeFile(path) {
  return () => {
    fs.unlink(path, () => {
      console.log('Successfully deleted %s', path);
    });
  };
}

function streamFile(res, path) {
  return () => {
    var rs = fs.createReadStream(path);
    rs.pipe(res);
    rs.on('end', removeFile(path));
  };
}

function addPropsAsync(lecture) {
  return Handout.findOne(_.pick(lecture, ['playlistId', 'videoId']))
  .then((handout) => {
    lecture.hasHandout = _.isNull(handout) ? false : true;
    return lecture;
  });
}

