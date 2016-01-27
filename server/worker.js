'use strict';

require('dotenv').load();

const g = require('./components/google-api');
const cfg = require('./config/environment');
const scraper = require('./components/scraper');
const stealth = require('./components/stealth');
const User = require('./models/user.model');
const Class = require('./models/class.model');
const _ = require('lodash');

let playlists = g.youtube.bind(null, 'playlists.list');

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
    console.log('WORKER] Connecting consumer..');
    sub.on('data', addClasses);
  });
}

function addClasses(user) {
  user = JSON.parse(user);

  User.findById(user._id).exec()
  .then(g.bindAuthAsync)
  .then(saveAllMyLists)
  .then((classes) => {
    console.log(`WORKER] ${user.email}'s all playlists are added`);
    return updateAllClassesViews(classes);
  })
  .then(() => console.log(`WORKER] ${user.email}'s all playlists are fetched with views`))
  .catch((e) => console.error(e.stack));
}

function updateAllClassesViews(classes) {
  return _.chunk(classes, cfg.scrapConcurrentNum)
  .reduce((promise, chunked, chunkedIdx) => {
    return promise.then(() => {
      let updateClasses = chunked.map((c, classIdx) => {
        return scraper.fetchViews(c.playlistId)
        .then((views) => {
          c.views = views;
          return c.save();
        });
      });

      return Promise.all(updateClasses);
    });
  }, Promise.resolve());
}

function saveAllMyLists() {
  let allClasses = [];

  return (function recursive(p) {
    let params = _.assign({
      part: 'id,snippet,status',
      mine: true,
    }, p || {});

    return playlists(params)
    .then((res) => {
      return Promise.all(res.items.map(Class.createOrUpdate))
      .then((classes) => {
        allClasses = allClasses.concat(classes);
        if (_.has(res, 'nextPageToken')) {
          return recursive({ pageToken: res.nextPageToken });
        }
        return allClasses;
      });
    });
  })();
}

