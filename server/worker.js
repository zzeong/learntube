'use strict';

require('dotenv').load();

const g = require('./components/google-api');
const cfg = require('./config/environment');
const scraper = require('./components/scraper');
const stealth = require('./components/stealth');

stealth
.addPorter('db', `mongodb://${process.env.MONGO_IP}/${process.env.MONGO_DBNAME}`, cfg.mongo.options)
.addPorter('mq', `amqp://${process.env.RABBIT_IP}`)
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
    mine: true,
  };

  g.bindAuth(user);
  g.youtube('playlists.list', params)
  .then((res) => {
    let fetchPlaylistsViews = res.items.map((p) => scraper.updateClassModel(p));
    return Promise.all(fetchPlaylistsViews);
  })
  .then((all) => {
    console.log(`${user.email}'s all playlists was updated`);
  })
  .catch((err) => console.error(err.stack));
}
