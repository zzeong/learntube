'use strict';

var _ = require('lodash');
var g = require('../../../../components/google-api');
var config = require('../../../../config/environment');
var Promise = require('promise');


/**
 * @api {get} /api/youtube/mine/playlistitems Get my YouTube playlistItems
 * @apiName GetMyPlaylistItems
 * @apiGroup My playlist items
 *
 * @apiUse TokenAuth
 *
 * @apiParam {String} playlistId YouTube playlist id.
 * @apiParam {Boolean} [withDuration=false] A flag for containing duration.
 * @apiParamExample {json} Request-Example:
 *     {
 *       "playlistId": "PLDcnymzs18LWbmCFUlZie7VsxQ_FIF0_y"
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
exports.index = function (req, res) {
  g.oauth2Client.setCredentials({
    access_token: req.user.google.accessToken,
    refresh_token: req.user.google.refreshToken,
  });

  var params = {
    auth: g.oauth2Client,
    part: 'id,snippet,status',
    playlistId: req.query.playlistId,
    maxResults: config.google.maxResults,
    fields: 'items(id,snippet,status),nextPageToken',
  };

  g.youtube('playlistItems.list', params)
  .then(function (response) {
    var resBody = {
      pageToken: response.nextPageToken,
      items: response.items
    };

    if (req.query.withDuration) {
      g.youtube('videos.list', {
        auth: g.oauth2Client,
        part: 'contentDetails',
        id: resBody.items.map(function (item) {
          return item.snippet.resourceId.videoId;
        }).join(','),
        fields: 'items(contentDetails(duration))',
      })
      .then(function (response) {
        resBody.items.forEach(function (item, i) {
          item.contentDetails = response.items[i].contentDetails;
        });
        return res.status(200).json(resBody);
      }, function (error) {
        return res.status(500).send(error);
      });

      return;
    }

    return res.status(200).json(resBody);
  }, function (error) {
    return res.status(500).send(error);
  });
};


/**
 * @api {post} /api/youtube/mine/playlistitems Create my YouTube playlistItem
 * @apiName CreateMyPlaylistItem
 * @apiGroup My playlist items
 *
 * @apiUse TokenAuth
 *
 * @apiParam {Object} resource **POST body**. It must be [playlistItem resource](https://developers.google.com/youtube/v3/docs/playlists#resource)
 * which have `snippet.playlistId`, `snippet.resourceid.kind`, `snippet.resourceid.videoId`, `status.privacyStatus`.
 * @apiParam {Boolean} [withDuration=false] A flag for containing duration.
 * @apiParamExample {json} Request-Example:
 *     BODY
 *     {
 *       "resource": {
 *         "snippet": {
 *            "playlistId": "PLDcnymzs18LWbmCFUlZie7VsxQ_FIF0_y",
 *            "resourceId": {
 *              "kind": "youtube#video",
 *              "videoId": "D8t8A8E_Tqc",
 *            }
 *         },
 *         "status": {
 *           "privacyStatus": "public"
 *         }
 *       }
 *     }
 *
 *     PARAMS
 *     {
 *       "withDuration": true
 *     }
 *
 *
 * @apiSuccess (Success 201) {Object} playlistItem_resource Inserted [playlistItem resource](https://developers.google.com/youtube/v3/docs/playlistItems#resource).\
 * A item of playlist resource **only** return `id`, `snippet`, `status` property.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 201 OK
 *     {
 *       playlistItem_resource_properties
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


  g.youtube('playlistItems.insert', params)
  .then(function (item) {
    if (req.query.withDuration) {
      g.youtube('videos.list', {
        auth: g.oauth2Client,
        part: 'contentDetails',
        id: item.snippet.resourceId.videoId,
        fields: 'items(contentDetails(duration))',
      })
      .then(function (response) {
        item.contentDetails = response.items[0].contentDetails;
        return res.status(201).json(item);
      }, function (error) {
        return res.status(500).send(error);
      });

      return;
    }

    return res.status(201).json(item);
  }, function (error) {
    return res.status(500).send(error);
  });
};

/**
 * @api {delete} /api/youtube/mine/playlistitems Destroy my YouTube playlistItem
 * @apiName DestroyMyPlaylistItem
 * @apiGroup My playlist items
 *
 * @apiUse TokenAuth
 *
 * @apiParam {Object} params **DELETE body**. It must be [playlistItem resource](https://developers.google.com/youtube/v3/docs/playlists#resource)
 * which have `playlistItemId`.
 * @apiParamExample {json} Request-Example:
 *
 *     PARAMS
 *     {
 *       "playlistItemId": "PL0kbKBabmRWUW4f5HSWIvzp0wFEtYNTJeS7dhDMTqKVk"
 *     }
 *
 *
 * @apiSuccess (Success 204) {Object} playlistItem_resource Destroyed [playlistItem resource](https://developers.google.com/youtube/v3/docs/playlistItems#resource).\
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 204 OK
 *     {
 *        "no content"
 *     }
 */

exports.destroy = function (req, res) {
  g.oauth2Client.setCredentials({
    access_token: req.user.google.accessToken,
    refresh_token: req.user.google.refreshToken,
  });

  var playlistItemIdArr = req.query.playlistItemId.split(',');

  var promises = playlistItemIdArr.map(function (arrayItem) {

    var params = {
      auth: g.oauth2Client,
      id: arrayItem,
    };

    return g.youtube('playlistItems.delete', params);
  });

  Promise.all(promises).then(function () {
    return res.status(204).send();
  }, function (error) {
    return res.status(500).send(error);
  });


};
