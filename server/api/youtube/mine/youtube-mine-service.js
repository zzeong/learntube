'use strict';

function applyAdditional(g, list) {
  if (!list.length) { list = [list]; }
  var id = serializeId(list, ',');

  function serializeId(list, delimiter) {
    return list.map(function (item) {
      return item.snippet.resourceId.videoId;
    }).join(delimiter);
  }

  return g.youtube('videos.list', {
    part: 'contentDetails,status,statistics',
    id: id,
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

