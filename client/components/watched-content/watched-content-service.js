'use strict';

angular.module('learntubeApp')
.factory('WatchedContent', function (Auth, $resource) {
  var watchedContent = $resource('/api/users/:id/watched-contents/:cid', {
    id: '@id',
    cid: '@cid',
  }, {
    query: {
      method: 'GET',
      isArray: true,
      params: { id: Auth.getCurrentUser()._id }
    },
    get: {
      method: 'GET',
      params: { id: Auth.getCurrentUser()._id }
    },
    create: {
      method: 'POST',
      params: { id: Auth.getCurrentUser()._id }
    },
    remove: {
      method: 'DELETE',
      params: { id: Auth.getCurrentUser()._id }
    },
  });

  watchedContent.lecture = $resource('/api/users/:id/watched-contents/:cid/lectures/:lid/:controller', {
    id: '@id',
    cid: '@cid',
    lid: '@lid',
  }, {
    create: {
      method: 'POST',
      params: { id: Auth.getCurrentUser()._id }
    },
  });

  return watchedContent;
});
