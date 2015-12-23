'use strict';

var _ = require('lodash');
var g = require('../../../../components/google-api');
var config = require('../../../../config/environment');
var gapiHelper = require('../youtube-mine-service');
var Class = require('../../../../models/class.model');

require('mongoose').Promise = Promise;

/**
 * @apiDefine TokenAuth
 * @apiHeader {String} Authorization A token is, after `Bearer` string, a user unique jwt token.\
 * This is created as follows: `Bearer {token}`
 * @apiHeaderExample {json} Header-example:
 *     {
 *       "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NWY1N2FmNGY4NjBjYzNkNmY1MTZlMjYiLCJpYXQiOjE0NDIxNTExNTYsImV4cCI6MTQ0MjE2OTE1Nn0.kXLSnKqb58tu9NTbbafMh_hDIP7gz8LDCcE0UEDutQo"
 *     }
 */


/**
 * @api {get} /api/youtube/mine/playlists Get my YouTube playlists
 * @apiName GetMyPlaylists
 * @apiGroup My playlists
 *
 * @apiUse TokenAuth
 *
 * @apiSuccess {Array} items Set of [playlist resource](https://developers.google.com/youtube/v3/docs/playlists#resource).\
 * A item of playlist resource **only** return `id`, `snippet`, `status` property.
 * @apiSuccess {String} pageToken Token which is needed when request for next items set.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "items": [
 *         playlists_resource
 *       ],
 *       "pageToken": "DJGNdN"
 *     }
 */
exports.index = function (req, res, next) {
  var body = {};
  var params = {
    part: 'id,snippet,status',
    mine: true,
    maxResults: config.google.maxResults,
    fields: 'items(id,snippet,status),nextPageToken',
  };

  g.youtube('playlists.list', params)
  .then(function (response) {
    body = gapiHelper.createBodyForList(response);
    return req.user.updateAccessToken(g);
  })
  .then(function () {
    body.items = body.items.map(function (item) {
      return {
        thumbnailUrl: item.snippet.thumbnails.medium.url,
        title: item.snippet.title,
        id: item.id,
      };
    });

    var promises = body.items.map(function (item) {
      return Class.findOne({ playlistId: item.id }).exec()
      .then(function (classe) {
        if (!classe) {
          item.rate = 0;
          item.views = 0; // this is UNTRUSTORTHY value. it will be repalce when a crawler is created.
          return Promise.resolve();
        }
        item.rate = _.has(classe.toObject(), 'rate') ? classe.rate : 0;
        item.views = classe.views;
        return Promise.resolve();
      });
    });

    return Promise.all(promises);
  })
  .then(function () {
    res.status(200).json(body);
  })
  .catch(next);
};


/**
 * @api {post} /api/youtube/mine/playlists Create my YouTube playlist
 * @apiName CreateMyPlaylist
 * @apiGroup My playlists
 *
 * @apiUse TokenAuth
 *
 * @apiParam {Object} resource **POST body**. It must be [playlist resource](https://developers.google.com/youtube/v3/docs/playlists#resource)
 * which have `snippet.title`, `snippet.description`, `status.privacyStatus`.
 * @apiParamExample {json} Request-Example:
 *     {
 *       "resource": {
 *         "snippet": {
 *            "title": "My Awesome Playlist",
 *            "description": "It is fantastic."
 *         },
 *         "status": {
 *           "privacyStatus": "public"
 *         }
 *       }
 *     }
 *
 * @apiSuccess (Success 201) {Object} playlist_resource Inserted [playlist resource](https://developers.google.com/youtube/v3/docs/playlists#resource).\
 * A item of playlist resource **only** return `id`, `snippet`, `status` property.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 201 OK
 *     {
 *       playlist_resource_properties
 *     }
 */
exports.create = (req, res, next) => {
  let body = {};
  let params = _.assign({
    part: 'snippet,status',
    fields: 'id,snippet,status',
  }, _.pick(req.body, 'resource'));

  g.youtube('playlists.insert', params)
  .then((item) => {
    let doc = {
      categorySlug: req.body.extras.categorySlug,
      playlistId: item.id,
      channelId: item.snippet.channelId,
      rate: 0,
      views: 0,
    };

    body = {
      thumbnailUrl: item.snippet.thumbnails.medium.url,
      title: item.snippet.title,
      id: item.id,
      rate: doc.rate,
      views: doc.views,
    };

    return Class.create(doc);
  })
  .then(() => req.user.updateAccessToken(g))
  .then(() => { res.status(201).json(body); })
  .catch(next);
};


/**
 * @api {delete} /api/youtube/mine/playlists Delete my YouTube playlist
 * @apiName DeleteMyPlaylist
 * @apiGroup My playlists
 *
 * @apiUse TokenAuth
 *
 * @apiParam {String} playlistId YouTube playlist id.
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "playlistId": "PLDcnymzs18LWbmCFUlZie7VsxQ_FIF0_y"
 *     }

 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 204 No Content
 */
exports.destroy = (req, res, next) => {
  let pid = req.query.playlistId;
  let params = { id: pid };

  g.youtube('playlists.delete', params)
  .then(() => Class.findOne({ playlistId: pid }).exec())
  .then(() => req.user.updateAccessToken(g))
  .then(() => { res.status(204).send(); })
  .catch(next);
};
