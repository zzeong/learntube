'use strict';

var _ = require('lodash');
var g = require('../../../../components/google-api');
var config = require('../../../../config/environment');
var gapiHelper = require('../youtube-mine-service');

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
exports.create = function (req, res, next) {
  var body = {};
  var params = _.assign({
    part: 'snippet,status',
    fields: 'id,snippet,status',
  }, req.body);

  g.youtube('playlists.insert', params)
  .then(function (item) {
    body = item;
    return req.user.updateAccessToken(g);
  })
  .then(function () {
    res.status(201).json(body);
  })
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
exports.destroy = function (req, res, next) {
  var params = { id: req.query.playlistId, };

  g.youtube('playlists.delete', params)
  .then(function () {
    return req.user.updateAccessToken(g);
  })
  .then(function () {
    res.status(204).send();
  })
  .catch(next);
};
