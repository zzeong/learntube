'use strict';

angular.module('learntubeApp')
.factory('NoteAPI', function(Auth, $resource) {
  return $resource('/api/users/:id/notes/:nid/:controller', {
    id: '@id',
    nid: '@nid',
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
    meta: {
      method: 'GET',
      params: { id: Auth.getCurrentUser()._id, nid: 'meta' },
      isArray: true
    },
    getContents: {
      method: 'GET',
      params: {
        id: Auth.getCurrentUser()._id,
        controller: 'get-contents'
      },
    },
  });
});
