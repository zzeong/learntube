'use strict';

require('dotenv').load();

const g = require('./components/google-api');
const config = require('./config/environment');
const scraper = require('./components/scraper');
const stealth = require('./components/stealth');

stealth
.addPorter('db', config.mongo.uri, config.mongo.options)
.addPorter('mq')
.activate();

stealth.on('ready', beginWork);

function beginWork() {
  let ctx = stealth.porter.mq.service;
  let sub =  ctx.socket('SUB');

  sub.setEncoding('utf8');
  sub.connect('scrap', () => {
    console.log('Connecting consumer..');
    sub.on('data', updateViews);
  });
}

function updateViews(usr) {
  let user = JSON.parse(usr);
  let params = {
    part: 'id,snippet,status',
    maxResults: process.env.GOOGLE_MAX_RESULTS,
    mine: true,
  };

  g.setOAuth(user);
  g.youtube('playlists.list', params)
  .then((res) => {
    let fetchPlaylistsViews = res.items.map((p) => scraper.updateClassModel(p));
    return Promise.all(fetchPlaylistsViews);
  })
  .then((all) => {
    console.log(`${user.email}'s all playlists was updated`);
  })
  .catch(console.error);
}
