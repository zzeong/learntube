'use strict';

require('dotenv').load();

const _ = require('lodash');
const schedule = require('node-schedule');
const winston = require('winston');
const moment = require('moment');
const mkdirp = require('mkdirp');
const scraper = require('./components/scraper');
const stealth = require('./components/stealth');
const Class = require('./models/class.model');
const cfg = require('./config/environment');

var logger = null;

mkdirp('logs', (err) => {
  initLogger();
  stealth.addPorter('db', `mongodb://${process.env.MONGO_IP}/${process.env.MONGO_DBNAME}`, cfg.mongo.options).activate();
  stealth.on('ready', executeJob('0 0 * * *'));
});

function executeJob(crontime) {
  return () => {
    logger.info('Reserve cron to scrap');

    schedule.scheduleJob(crontime, () => {
      let count = 0;
      let classes = [];

      logger.info('Cron is beginning..');

      Class.find({}).stream()
      .on('data', (c) => { classes.push(c); })
      .on('error', logger.error)
      .on('close', () => {
        let chunked = _.chunk(classes, cfg.scrapConcurrentNum);
        chunked.reduce((promise, partialClasses) => {
          return promise.then(() => {
            let updateClasses = partialClasses.map((c) => {
              return scraper.fetchViews(c.playlistId)
              .then((views) => {
                c.views = views;
                return c.save();
              })
              .then((c) => {
                count++;
                logger.log('verbose', `Class#${count} is completed`, {
                  doc: c.toObject({ transform: delId })
                });
              });
            });

            return Promise.all(updateClasses);
          });
        }, Promise.resolve())
        .then(() => {
          logger.info('Cron is finished');
          process.exit(0);
        })
        .catch(logger.error);
      });
    });
  };

  function delId(doc, ret) {
    delete ret._id;
    return ret;
  }
}

function initLogger() {
  let format = 'hh:mm:ss.SSS';
  logger = new (winston.Logger)({
    transports: [
      new (winston.transports.File)({
        filename: `logs/${moment().format('YYYY-MM-DD')}.log`,
        timestamp: timeFormat(format),
        level: 'debug',
      }),
      new (winston.transports.Console)({
        timestamp: timeFormat(format),
        level: 'info',
      })
    ]
  });

  function timeFormat(f) {
    return () => moment().format(f);
  }
}

