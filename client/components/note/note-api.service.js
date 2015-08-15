'use strict';

angular.module('learntubeApp')
.factory('NoteAPI', function(Auth, $resource) {
  return $resource('/api/users/:id/notes/:nid', {
    id: '@_id',
    nid: '@_nid',
  }, {
    query: {
      method: 'GET',
      params: { id: Auth.getCurrentUser()._id },
      isArray: true
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
