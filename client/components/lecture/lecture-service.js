'use strict';

angular.module('learntubeApp')
.factory('Lecture', function (Auth, $resource) {
  return $resource('/api/users/:id/classes/:cid/lectures/:lid/:controller', {
    id: '@id',
    cid: '@cid',
    lid: '@lid',
  }, {
    create: {
      method: 'POST',
      params: { id: Auth.getCurrentUser()._id }
    },
  });
});
