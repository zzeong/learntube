'use strict';

const rabbitmq = require('rabbit.js');
const mongoose = require('mongoose');
const EventEmitter = require('events');
const _ = require('lodash');

function Stealth() {
  EventEmitter.call(this);
  this.porter = {};
  this.readyCount = 0;
}

Stealth.prototype = Object.create(EventEmitter.prototype);

Stealth.prototype.addPorter = function (type, uri, opt) {
  let types = ['db', 'mq'];
  if (_.includes(types, type)) {
    if ('db' === type) {
      let init = mongoose.connect.bind(mongoose, uri, opt);
      initPorter.call(this, type, init, 'connected');
    }
    if ('mq' === type) {
      let init = rabbitmq.createContext.bind(null, uri, opt);
      initPorter.call(this, type, init, 'ready');
    }
  } else {
    throw new Error(`Undefined service type: ${type}`);
  }

  return this;

  function initPorter(type, initFn, readyEventName) {
    // jshint validthis:true
    _.set(this.porter, `${type}.init`, initFn);
    _.set(this.porter, `${type}.readyEventName`, readyEventName);
  }
};

Stealth.prototype.activate = function () {
  _.forEach(this.porter, (v, k) => {
    let service = v.service = v.init();
    service = k === 'db' ? service.connection : service;
    service.on(v.readyEventName, this.ready.bind(this));
  });
};

Stealth.prototype.ready = function () {
  this.readyCount++;
  if (this.readyCount === Object.keys(this.porter).length) {
    this.emit('ready');
  }
};

module.exports = new Stealth();

