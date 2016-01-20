'use strict';

const _ = require('lodash');

function applyAdditional(g, list) {
  if (!list.length) { list = [list]; }
  let ids = list.map(_.property('snippet.resourceId.videoId'));

  return g.youtube('videos.list', {
    part: 'contentDetails,status,statistics',
    id: ids,
    fields: 'items(contentDetails(duration),status(uploadStatus,rejectionReason,privacyStatus),statistics)',
  })
  .then(function (response) {
    list.forEach(function (item, i) {
      item.contentDetails = response.items[i].contentDetails;
      item.status = response.items[i].status;
      item.statistics = response.items[i].statistics;
    });
  });
}

function createBodyForList(res) {
  var body = { items: res.items };
  if (res.nextPageToken) {
    body.pageToken = res.nextPageToken;
  }
  return body;
}

module.exports.applyAdditional = applyAdditional;
module.exports.createBodyForList = createBodyForList;

