'use strict';

var g = require('../google-api');
var url = require('url');
var config = require('../../config/environment');
var Class = require('../../models/class.model');
var xray = require('x-ray')();

require('mongoose').Promise = Promise;

function x() {
  let args = arguments;
  return new Promise((resolve, reject) => {
    xray.apply(null, args)((err, results) => {
      if (err) { reject(err); }
      resolve(results);
    });
  });
}

function updateClassModel(item) {
  return fetchViews(item.id)
  .then((views) => {
    let query = {
      playlistId: item.id,
      channelId: item.snippet.channelId
    };
    let update = {
      $set: { views },
      $setOnInsert: { rate: 0 }
    };
    let options = {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    };
    return Class.findOneAndUpdate(query, update, options).exec();
  })
  .catch(console.error);
}

function fetchViews(id) {
  let selector = '#pl-header .pl-header-details li';
  return x(getPlaylistUrl(id), [selector])
  .then(parseViews);
}

function parseViews(results) {
  let viewStr = '';
  try {
    viewStr = results.find((el) => !!el.match(/views|조회수/)) || results[2] || '0';
  } catch (e) {
    console.err(e);
  }
  return +(viewStr.match(/[0-9,]+/) || [''])[0].replace(/,/g, '');
}


function getPlaylistUrl(id) {
  let urlObj = {
    protocol: 'https',
    host: 'www.youtube.com',
    pathname: '/playlist',
    query: { list: id }
  };
  return url.format(urlObj);
}

exports.fetchViews = fetchViews;
exports.updateClassModel = updateClassModel;

exports.updatePlaylistViews = (req, res, next) => {
  let params = {
    part: 'id,snippet,status',
    mine: 'true',
    maxResults: config.google.maxResults,
  };

  res.on('finish', () => {
    g.youtube('playlists.list', params)
    .then((r) => Promise.all(r.items.map((item) => updateClassModel(item))))
    .then(() => { console.log('All playlists are updated'); })
    .catch(next);
  });
  next();
};
