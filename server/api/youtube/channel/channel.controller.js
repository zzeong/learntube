'use strict';

var _ = require('lodash');
var google = require('googleapis');
var youtube = google.youtube('v3');
var config = require('../../../config/environment');
var User = require('../../user/user.model');

exports.index = function(req, res) {

  var params = {
    auth: config.google.serverKey,
    part: 'snippet,status',
    id: req.query.channelId,
  };

  youtube.channels.list(params, function(err, response) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(response.items);
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}

