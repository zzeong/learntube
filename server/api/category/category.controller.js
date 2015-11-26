'use strict';

var _ = require('lodash');
var Class = require('../../models/class.model');
var g = require('../../components/google-api');
var slugs = require('../../components/slug').categories;
var apiKey = 'AIzaSyBQVxlBd8w_jm7ucPo9r8iO6g5rQwVnw7o';


function bindAdditionalProp (classes) {
  var chunkedIdsBy20 = _.chunk(classes, 20).map(function (subarr) {
    return subarr.map(function (classe) {
      return classe.playlistId;
    }).join(',');
  });


  var promises = chunkedIdsBy20.map(function (ids) {
    var params = {
      auth: apiKey,
      part: 'snippet',
      id: ids,
    };
    return g.youtube('playlists.list', params);
  });

  return Promise.all(promises)
  .then(function (allres) {
    var items =  _.flatten(allres.map(function (res) {
      return res.items;
    }));

    var obj = {};
    items.forEach(function (item) {
      obj[item.id] = {
        playlistTitle: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnailUrl: item.snippet.thumbnails.medium.url,
      };
    });

    var results = classes.map(function (classe) {
      classe = classe.toObject();
      return _.assign(classe, obj[classe.playlistId]);
    });
    return Promise.resolve(results);
  });
}


exports.index = function (req, res, next) {
  var params = {};
  if (req.query.slug) {
    params.categorySlug = req.query.slug;
  }

  Class.find(params)
  .sort({ rate: 'desc' })
  .limit(40)
  .exec()
  .then(function (classes) {
    return bindAdditionalProp(classes);
  })
  .then(function (classes) {
    res.status(200).json(classes);
  })
  .catch(next);
};

exports.getEachTop = function (req, res, next) {
  var promises = slugs.map(function (slug) {
    return Class.find({ categorySlug: slug })
    .sort({ rate: 'desc' })
    .limit(5).exec();
  });

  Promise.all(promises)
  .then(function (classesArr) {
    var classes = _.flatten(classesArr);
    return bindAdditionalProp(classes);
  })
  .then(function (classes) {
    res.status(200).json(classes);
  })
  .catch(next);
};
