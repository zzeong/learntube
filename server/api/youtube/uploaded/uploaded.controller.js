'use strict';

var _ = require('lodash');
var google = require('googleapis');
var youtube = google.youtube('v3');
var config = require('../../../config/environment');
var User = require('../../user/user.model');
var OAuth2 = google.auth.OAuth2;
var oauth2Client = new OAuth2(config.google.clientID, config.google.clientSecret, config.google.callbackURL);

exports.index = function(req, res) {
  User.findById(req.user._id, function(err, user) {
    if(err) { return handleError(res, err); } 
    if(!user) { return res.status(401).send('Not Found'); }

    oauth2Client.setCredentials({
      access_token: user.google.accessToken,
      refresh_token: user.google.refreshToken,
    });

    youtube.playlists.list({
      auth: oauth2Client,
      part: 'snippet,status',
      mine: true,
      maxResults: config.google.maxResults,
    }, function(err, resFromYT) {
      return res.status(200).json(resFromYT.items);
    });
  });
};

exports.insert = function(req, res) {
  User.findById(req.user._id, function(err, user) {
    if(err) { return handleError(res, err); }
    if(!user) { return res.status(401).send('Not Found'); } 

    oauth2Client.setCredentials({
      access_token: user.google.accessToken,
      refresh_token: user.google.refreshToken,
    });

    var params = _.assign({ auth: oauth2Client }, req.body);
    youtube.playlists.insert(params, function(err, resFromYT) {
      var item = resFromYT;
      return res.status(201).json(item);
    });
  });
};

exports.destroy = function(req, res) {
  User.findById(req.user._id, function(err, user) {
    if(err) { return handleError(res, err); } 
    if(!user) { return res.status(401).send('Not Found'); } 

    oauth2Client.setCredentials({
      access_token: user.google.accessToken,
      refresh_token: user.google.refreshToken,
    });

    youtube.playlists.delete({
      auth: oauth2Client,
      id: req.params.pid,
    }, function(err) {
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}
