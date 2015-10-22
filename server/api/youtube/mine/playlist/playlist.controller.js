'use strict';

var _ = require('lodash');
var g = require('../../../../components/google-api');
var config = require('../../../../config/environment');

var mongoose = require('mongoose');
var Promise = mongoose.Promise = require('promise');


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
exports.index = function (req, res) {
  g.oauth2Client.setCredentials({
    access_token: req.user.google.accessToken,
    refresh_token: req.user.google.refreshToken,
  });

  var params = {
    auth: g.oauth2Client,
    part: 'id,snippet,status',
    mine: true,
    maxResults: config.google.maxResults,
    fields: 'items(id,snippet,status),nextPageToken',
  };

  g.youtube('playlists.list', params)
  .then(function (response) {
    var resBody = { items: response.items };
    if (response.nextPageToken) {
      resBody.pageToken = response.nextPageToken;
    }
    if (req.user.google.accessToken !== g.oauth2Client.credentials.access_token) {
      req.user.google.accessToken = g.oauth2Client.credentials.access_token;
      return req.user.save()
      .then(function () { res.status(200).json(resBody); })
      .catch(res.status(500).send);
    }
    return res.status(200).json(resBody);
  }, function (error) {
    return res.status(500).send(error);
  });
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
exports.create = function (req, res) {
  g.oauth2Client.setCredentials({
    access_token: req.user.google.accessToken,
    refresh_token: req.user.google.refreshToken,
  });

  var params = _.assign({
    auth: g.oauth2Client,
    part: 'snippet,status',
    fields: 'id,snippet,status',
  }, req.body);

  g.youtube('playlists.insert', params)
  .then(function (item) {
    if (req.user.google.accessToken !== g.oauth2Client.credentials.access_token) {
      req.user.google.accessToken = g.oauth2Client.credentials.access_token;
      return req.user.save()
      .then(function () { res.status(201).json(item); })
      .catch(res.status(500).send);
    }
    return res.status(201).json(item);
  }, function (error) {
    return res.status(500).send(error);
  });
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
exports.destroy = function (req, res) {
  g.oauth2Client.setCredentials({
    access_token: req.user.google.accessToken,
    refresh_token: req.user.google.refreshToken,
  });

  var params = {
    auth: g.oauth2Client,
    id: req.query.playlistId,
  };

  g.youtube('playlists.delete', params)
  .then(function () {
    if (req.user.google.accessToken !== g.oauth2Client.credentials.access_token) {
      req.user.google.accessToken = g.oauth2Client.credentials.access_token;
      return req.user.save()
      .then(function () { res.status(204).send(); })
      .catch(res.status(500).send);
    }
    return res.status(204).send();
  }, function (error) {
    return res.status(500).send(error);
  });
};
