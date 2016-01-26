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
  req.query.mine = req.query.mine || false;
  if (!req.user && req.query.mine) {
    return next(new Error('Unauthorized'));
  }

  prefetchData(req.query)
  .then(playlists.list)
  .then((res) => {
    let updateClasses = res.items.map((item) => {
      return createOrUpdateClass(item)
      .then(_.method('bindYoutube', item));
    });

    return Promise.all(updateClasses);
  })
  .then((classes) => res.status(200).json(classes))
  .catch((err) => {
    if (_.has(err, 'errors')) {
      if (_.find(err.errors, { reason: 'channelNotFound' })) {
        return res.status(404).json({ message: 'channelNotFound' });
      } else {
        return next(err);
      }
    }
    next(err);
  });

  function prefetchData(query) {
    let ytquery = queryFor(query, 'youtube');

    if (query.mine) {
      return Promise.resolve(_.assign(ytquery, { mine: query.mine }));
    } else {
      let sort = {};
      sort[req.query.orderBy || 'rating'] = 'desc';

      return Class.find(queryFor(query, 'db'))
      .sort(sort)
      .limit(20).exec()
      .then((classes) => {
        if (_.isEmpty(classes)) { return ytquery; }

        let id = classes.map(_.property('playlistId'));
        return _.assign(ytquery, { id });
      });
    }
  }
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
    .sort({ rate: 'desc' })
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

function queryFor(reqQuery, target) {
  let refinder = {
    db: (q) => {
      let query = {};
      if (q.categorySlug) { query.categorySlug = q.categorySlug; }
      if (q.playlistId) { query.playlistId = q.playlistId; }

      return query;
    },
    youtube: (q) => {
      let query = { part: 'id,snippet,status' };

      if (q.mine) { query.mine = q.mine; }
      if (q.playlistId) { query.id = q.playlistId; }
      query = q.mine ? _.omit(query, 'id') : _.omit(query, 'mine');

      return query;
    }
  };
  return refinder[target](reqQuery);
}

function createOrUpdateClass(item) {
  let query = { playlistId: item.id };
  let update = {
    $set: { channelId: item.snippet.channelId },
    $setOnInsert: { rate: 0 }
  };
  let options = {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true
  };

  return Class.findOneAndUpdate(query, update, options).exec();
}

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

