'use strict';

var url = require('url');
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

function fetchViews(playlistId) {
  let selector = '#pl-header .pl-header-details li';
  return x(getPlaylistUrl(playlistId), [selector])
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
