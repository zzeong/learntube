(function (angular) {
  'use strict';

  angular.module('learntubeApp')
  .factory('Note', NoteFactory);

  function NoteFactory(Auth, $resource, Upload) {
    var ids = {};
    var note = $resource('/api/users/:id/notes/:nid/:controller', {
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
      getContents: {
        method: 'GET',
        params: {
          id: Auth.getCurrentUser()._id,
          controller: 'get-contents'
        },
      },
    });

    note.editor = new NoteEssence('editor');
    note.file = new NoteEssence('file');

    note.setIds = function (idObj) { ids = idObj; };
    note.upload = function (type, file) {
      var fields = _.assign(ids, { type: type });
      return Upload.upload({
        url: '/api/users/' + Auth.getCurrentUser()._id + '/notes',
        method: 'POST',
        fields: fields,
        file: file,
      });
    };

    return note;

    function NoteEssence(type) {
      this.activator = null;
      this.obj = null;
      this.type = type;

      this.isOn = function () {
        if (this.type === 'editor') {
          return activator;
        }
        return !!activator;
      };

      this.setActivator = function (factor) {
        this.activator = factor;
        if (this.type === 'file') {
          this.obj = this.activator;
        }
      };
    }
  }

  NoteFactory.$inject = ['Auth', '$resource', 'Upload'];
})(angular);
