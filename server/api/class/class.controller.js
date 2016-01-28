'use strict';

const Class = require('../../models/class.model');
const g = require('../../components/google-api');
const slugs = require('../../components/slug').categories;
const _ = require('lodash');

require('mongoose').Promise = Promise;

let playlists = {
  list: g.youtube.bind(null, 'playlists.list'),
  insert: g.youtube.bind(null, 'playlists.insert'),
  update: g.youtube.bind(null, 'playlists.update'),
  delete: g.youtube.bind(null, 'playlists.delete'),
};

function index(req, res, next) {
  playlists.list(req.ytquery)
  .then((res) => {
    let updateClasses = res.items.map((item) => {
      return Class.createOrUpdate(item)
      .then(_.method('bindYoutube', item));
    });

    return Promise.all(updateClasses);
  })
  .then((classes) => res.status(200).json(getIndexEntity(req, classes)))
  .catch(next);
}

function create(req, res, next) {
  let params  = {
    part: 'snippet,status',
    resource: { status: { privacyStatus: 'public' }}
  };

  playlists.insert(_.assign(params, { resource: getResource(req.body) }))
  .then((item) => {
    let doc = _.assign(Class.extractDoc(item), {
      categorySlug: req.body.categorySlug
    });

    return Class.create(doc)
    .then((c) => res.status(201).json(c.bindYoutube(item)));
  })
  .catch(next);

}

function update(req, res, next) {
  let classe = null;
  let params = { part: 'snippet' };

  Class.findById(req.params.cid).exec()
  .then((c) => {
    classe = c;
    return playlists.update(_.assign(params, { resource: getResource(req.body) }));
  })
  .then((item) => {
    classe.playlistId = item.id;
    classe.channelId = item.snippet.channelId;

    return classe.save()
    .then((c) => res.status(201).json(c.bindYoutube(item)));
  })
  .catch(next);
}

function destroy(req, res, next) {
  let classe = null;
  Class.findById(req.params.cid).exec()
  .then((c) => {
    classe = c;
    return playlists.delete({ id: classe.playlistId });
  })
  .then(() => classe.remove())
  .then(() => res.status(204).send())
  .catch(next);
}

function getTops(req, res, next) {
  if (!req.query.num) { return res.status(500).send('No required params'); }
  let num = +req.query.num;
  let classes = null;

  Class.find({})
  .sort({ views: 'desc' })
  .limit(num)
  .exec()
  .then((c) => {
    classes = c;
    let params = { part: 'id,snippet,status' };

    let ids = classes.map(_.property('playlistId'));
    return playlists.list(_.assign(params, { id: ids }));
  })
  .then((response) => {
    let obj = _.keyBy(response.items, 'id');
    let entity = classes.map((c) => c.bindYoutube(obj[c.playlistId]));
    res.status(200).json(entity);
  })
  .catch(next);
}

function getEachCategory(req, res, next) {
  var findClassesByCategory = slugs.map((slug) => {
    return Class.find({ categorySlug: slug })
    .sort({ rating: 'desc' })
    .limit(5).exec();
  });

  let classes = null;
  Promise.all(findClassesByCategory)
  .then((chunkedClasses) => {
    classes = _.flatten(chunkedClasses);
    let params = { part: 'id,snippet,status' };
    let ids = classes.map((c) => c.playlistId);

    return playlists.list(_.assign(params, { id: ids }));
  })
  .then((response) => {
    let obj = _.keyBy(response.items, 'id');
    let entity = classes.map((c) => c.bindYoutube(obj[c.playlistId]));
    res.status(200).json(entity);
  })
  .catch(next);
}

exports.index = index;
exports.create = create;
exports.update = update;
exports.destroy = destroy;

exports.getTops = getTops;
exports.getEachCategory = getEachCategory;

function getResource(d) {
  let resource = {
    snippet: {
      title: d.title,
      description: d.description
    }
  };

  if (d.playlistId) { resource.id = d.playlistId; }
  return resource;
}

function getIndexEntity(req, items) {
  let entity = { items };
  if (_.has(req, 'nextPage')) { entity.nextPage = req.nextPage; }
  return entity;
}
