'use strict';

const _ = require('lodash');
const WatCtt = require('../../../models/watched-content.model');
const Class = require('../../../models/class.model');
const g = require('../../../components/google-api');

require('mongoose').Promise = Promise;

let playlists = {
  list: g.youtube.bind(null, 'playlists.list'),
  insert: g.youtube.bind(null, 'playlists.insert'),
  update: g.youtube.bind(null, 'playlists.update'),
  delete: g.youtube.bind(null, 'playlists.delete'),
};

function index(req, res, next) {
  WatCtt.find({ _watcher: req.params.id })
  .populate('_class').exec()
  .then((contents) => {
    contents = contents.filter((ctt) => {
      return _.has(req.query, 'playlistId') ?
        ctt._class.playlistId === req.query.playlistId : true;
    });
    let id = contents.map(_.property('_class.playlistId'));
    let defaults = { part: 'id,snippet,status,contentDetails' };
    return playlists.list(_.assign(defaults, { id }))
    .then((response) => {
      let obj = _.keyBy(response.items, 'id');
      let entity = contents.map((ctt) => {
        let c = ctt._class.bindYoutube(obj[ctt._class.playlistId]);
        ctt = ctt.toObject();
        ctt._class = c;
        return ctt;
      });
      res.status(200).json(entity);
    });
  })
  .catch(next);
}

function show(req, res, next) {
  WatCtt.findById(req.params.cid)
  .popoulate('_class')
  .then((content) => {
    let defaults = { part: 'id,snippet,status,contentDetails' };
    return playlists.list(_.assign(defaults, { id: content._class.playlistId }))
    .then((response) => {
      let c = content._class.bindYoutube(_.first(response.items));
      content = content.toObject();
      content._class = c;
      res.status(200).json(content);
    });
  })
  .catch(next);
}

function create(req, res, next) {
  let query = { playlistId: req.body.playlistId };
  Class.findOne(query).exec()
  .then((c) => {
    if (!c) {
      let defaults = { part: 'id,snippet,status' };
      return playlists.list(_.assign(defaults, { id: req.body.playlistId }))
      .then((item) => Class.create(Class.extractDoc(item)));
    }
    return c;
  })
  .then((c) => {
    let doc = {
      _watcher: req.params.id,
      _class: c._id
    };
    return WatCtt.create(doc);
  })
  .then((c) => res.status(201).json(c))
  .catch(next);
}

function destroy(req, res, next) {
  WatCtt.findByIdAndRemove(req.params.cid).exec()
  .then(() => res.status(204).send())
  .catch(next);
}

exports.index = index;
exports.show = show;
exports.create = create;
exports.destroy = destroy;

