'use strict';

angular.module('learntubeApp')
.filter('onlyPublic', function() {
  return function(items) {
    if(typeof items === 'undefined') { return true; }

    return items.filter(function(item) {
      return item.status.privacyStatus === 'public'; 
    });
  };
});
