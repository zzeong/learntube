'use strict';

var g = require('../../../../components/google-api');
var config = require('../../../../config/environment');
var Promise = require('promise');
var gapiHelper = require('../youtube-mine-service');

/**
 * @api {get} /api/youtube/mine/videos Get my YouTube videos
 * @apiName GetMyVideos
 * @apiGroup My videos
 *
 * @apiUse TokenAuth
 *
 * @apiParam {Boolean} [withDuration=false] A flag for containing duration.
 * @apiParamExample {json} Request-Example:
 *     {
 *       "withDuration": true
 *     }
 *
 * @apiSuccess {Array} items Set of [playlistItem resource](https://developers.google.com/youtube/v3/docs/playlistItems#resource).\
 * A item of playlistItem resource **only** return `id`, `snippet`, `status` property (when `withDuration` is true in request params, `contentDetails` is added).
 * @apiSuccess {String} pageToken Token which is needed when request for next items set.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "items": [
 *         playlistItems_resource
 *       ],
 *       "pageToken": "DJGNdN"
 *     }
 */
exports.index = function (req, res, next) {
  var body = {};

  g.youtube('channels.list', {
    part: 'contentDetails',
    mine: true,
    fields: 'items(contentDetails)',
  })
  .then(function (response) {
    var params = {
      part: 'id,snippet,status',
      playlistId: response.items[0].contentDetails.relatedPlaylists.uploads,
      maxResults: config.google.maxResults,
      fields: 'items(id,snippet,status),nextPageToken',
    };
    return g.youtube('playlistItems.list', params);
  })
  .then(function (response) {
    body = gapiHelper.createBodyForList(response);
    if (req.query.withDuration) {
      return gapiHelper.applyDuration(g, body.items);
    }
    return Promise.resolve();
  })
  .then(function () {
    return req.user.updateAccessToken(g);
  })
  .then(function () {
    return res.status(200).json(body);
  })
  .catch(next);
};
