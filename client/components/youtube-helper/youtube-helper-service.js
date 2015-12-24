(function (angular) {
  'use strict';

  angular.module('learntubeApp')
  .factory('YoutubeHelper', YoutubeHelper);

  function YoutubeHelper(GApi, GoogleConst) {
    return { applyAdditional: applyAdditional };

    function serializeIds(list, property) {
      return list.map(function (item) {
        return _.get(item, property);
      }).join(',');
    }

    function applyAdditional(list, property) {
      var ids = serializeIds(list, property);

      return GApi.execute('youtube', 'videos.list', {
        key: GoogleConst.browserKey,
        part: 'id,contentDetails,status,statistics',
        id: ids,
        fields: 'items(id,contentDetails(duration),status,statistics)',
      })
      .then(function (res) {
        var mappedById =  _.indexBy(res.items, (item) => item.id);
        return list.map((lecture) => {
          var videoId = _.get(lecture, property);
          return _.assign(lecture, _.omit(mappedById[videoId], 'id'));
        });
      });
    }
  }

  YoutubeHelper.$inject = ['GApi', 'GoogleConst'];
})(angular);
