(function (angular) {
  'use strict';

  angular.module('learntubeApp')
  .factory('LoadMore', LoadMoreFactory);

  function LoadMoreFactory($http) {
    return { createRequest: createRequest };

    function createRequest(url, creatingFn) {
      let params = creatingFn();
      return (p = {}) => {
        return $http.get(url, _.merge({ params }, p))
        .then((res) => {
          params = creatingFn(res.data);
          return res;
        });
      };
    }
  }

  LoadMoreFactory.$inject = ['$http'];
})(angular);
