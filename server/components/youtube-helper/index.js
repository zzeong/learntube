'use strict';

const _ = require('lodash');
const g = require('../google-api');

let videos = g.youtube.bind(null, 'videos.list');

function fetchExtras(list) {
  if (!list.length) { list = [list]; }

  let base = {
    part: 'id,contentDetails,status,statistics',
    fields: 'items(id,contentDetails(duration),status(uploadStatus,rejectionReason,privacyStatus),statistics)',
  };
  let ids = list.map((item) => {
    let get = _.get.bind(null, item);
    return get('snippet.resourceId.videoId') || get('id.videoId');
  });

  return videos(_.assign(base, { id: ids }))
  .then((res) => {
    let obj = _.keyBy(res.items, 'id');
    return list.map((item) => {
      let get = _.get.bind(null, item);
      let videoId = get('snippet.resourceId.videoId') || get('id.videoId');
      return _.assign(item, _.omit(obj[videoId], 'id'));
    });
  });
}

exports.fetchExtras = fetchExtras;
