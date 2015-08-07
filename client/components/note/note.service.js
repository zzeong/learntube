'use strict';

angular.module('learntubeApp')
.factory('Note', function(Auth, User, $cookieStore, $resource) {
  var Note = $resource('/api/users/:id/notes/:nid', {
    id: '@_id',
    nid: '@_nid',
  }, {
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

  Note.prototype.getNoteId = function(vid) {
    var me = Auth.getCurrentUser();
    return me.notes.filter(function(note) {
      return note.videoId === vid;
    }).pop()._id;
  };

  return Note;
});