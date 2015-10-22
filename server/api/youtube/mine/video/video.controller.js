'use strict';

var g = require('../../../../components/google-api');
var config = require('../../../../config/environment');


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
exports.index = function (req, res) {
  g.oauth2Client.setCredentials({
    access_token: req.user.google.accessToken,
    refresh_token: req.user.google.refreshToken,
  });

  g.youtube('channels.list', {
    auth: g.oauth2Client,
    part: 'contentDetails',
    mine: true,
    fields: 'items(contentDetails)',
  })
  .then(function (response) {
    return g.youtube('playlistItems.list', {
      auth: g.oauth2Client,
      part: 'id,snippet,status',
      playlistId: response.items[0].contentDetails.relatedPlaylists.uploads,
      maxResults: config.google.maxResults,
      fields: 'items(id,snippet,status),nextPageToken',
    });
  }, function (error) {
    if (error) { return res.status(500).send(error); }
  })
  .then(function (response) {
    var resBody = { items: response.items };
    if (response.nextPageToken) {
      resBody.pageToken = response.nextPageToken;
    }

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
        if (req.user.google.accessToken !== g.oauth2Client.credentials.access_token) {
          req.user.google.accessToken = g.oauth2Client.credentials.access_token;
          return req.user.save()
          .then(function () { res.status(204).json(resBody); })
          .catch(res.status(500).send);
        }
        return res.status(200).json(resBody);
      }, function (error) {
        return res.status(500).send(error);
      });

      return;
    }


    return res.status(200).json(resBody);
  }, function (error) {
    if (error) { return res.status(500).send(error); }
  });
};
