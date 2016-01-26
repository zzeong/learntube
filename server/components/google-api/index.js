'use strict';

const google = require('googleapis');
const config = require('../../config/environment');
google.options({ params: { maxResults: config.google.maxResults }});

const youtube = google.youtube('v3');
const _ = require('lodash');
const MAX_ID_LEN = 20;

let auth = null;

function api(method, params) {
  return new Promise((resolve, reject) => {
    _.get(youtube, method)(params, (err, res) => {
      if (err) { return reject(err); }
      return resolve(res);
    });
  });
}

function execute(method, params) {
  params = params || {};
  params.auth = params.auth || auth;

  if (_.isArray(params.id)) {
    if (params.id.length > MAX_ID_LEN) {
      let chunkedIds = _.chunk(params.id, MAX_ID_LEN);
      let requestApis = chunkedIds.map((ids) => {
        let id = ids.join(',');
        return api(method, _.assign(params, { id }));
      });

      return Promise.all(requestApis)
      .then((ress) => {
        return ress.reduce((pre, cur) => {
          pre.items = pre.items.concat(cur.items);
          return pre;
        });
      });
    }
    params.id = params.id.join(',');
  }

  return api(method, params);
}

function readyApi(req, res, next) {
  let tokenForLog = _.get(req, 'user.google.accessToken');
  console.log(`Auth] current access_token: ${tokenForLog}`);

  createAuthAsync(req.user)
  .then((created) => {
    auth = created;
    next();
  })
  .catch(next);
}

function createAuthAsync(user) {
  return new Promise((resolve, reject) => {
    if (_.isUndefined(user)) {
      return resolve(process.env.GOOGLE_SERVERKEY);
    }

    let oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_ID,
      process.env.GOOGLE_SECRET,
      process.env.GOOGLE_CALLBACK_URL
    );

    oauth2Client.setCredentials({
      access_token: user.google.accessToken,
      refresh_token: user.google.refreshToken,
    });

    oauth2Client.getAccessToken((err, token) => {
      if (err) { reject(err); }

      if (user.google.accessToken !== token) {
        let google = user.toObject().google;
        google.accessToken = token;
        user.google = google;

        user.save()
        .then((u) => {
          console.log(`Auth] refreshed access_token: ${u.google.accessToken}`);
          resolve(oauth2Client);
        });
      } else {
        resolve(oauth2Client);
      }
    });
  });
}

function bindAuthAsync(user) {
  return createAuthAsync(user)
  .then((created) => auth = created);
}

exports.youtube = execute;
exports.readyApi = readyApi;
exports.bindAuthAsync = bindAuthAsync;
