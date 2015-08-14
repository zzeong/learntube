'use strict';

angular.module('learntubeApp')
.factory('ClassAPI', function(Auth, $resource) {
  return $resource('/api/users/:id/classes/:cid', {
    id: '@_id',
    cid: '@_cid',
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
    update: {
      method: 'PUT', 
      params: { id: Auth.getCurrentUser()._id }
    },
  });
});