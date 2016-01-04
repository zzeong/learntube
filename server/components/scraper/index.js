'use strict';

var _ = require('lodash');
var g = require('../google-api');
var noodle = require('noodlejs');
var url = require('url');
var config = require('../../config/environment');
var Class = require('../../models/class.model');

function scrapAndUpdateViews(item) {
  let query = {
    url: getPlaylistUrl(item.id),
    selector: '#pl-header .pl-header-details li',
    extract: 'text'
  };

  let views = 0;
  let dbQuery = {};

  return noodle.query(query)
  .then((result) => {
    let viewStr = result.results[0].results.find((el) => !!el.match(/views|조회수/)) ||
      result.results[0].results[2];
    views = +(viewStr.match(/[0-9]+/) || [''])[0];
    dbQuery = {
      playlistId: item.id,
      channelId: item.snippet.channelId,
    };

    return Class.findOne(dbQuery).exec();
  })
  .then((classe) => {
    classe = classe || new Class(_.assign(dbQuery, { rate: 0, views }));
    classe.views = views;
    return classe.save();
  });
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

exports.bookToGetPlaylists = (req, res, next) => {
  let params = {
    part: 'id,snippet,status',
    mine: 'true',
    maxResults: config.google.maxResults,
  };

  res.on('finish', () => {
    g.youtube('playlists.list', params)
    .then((response) => response.items.map(scrapAndUpdateViews))
    .catch(next);
  });
  next();
};
