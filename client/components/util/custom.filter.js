'use strict';

angular.module('learntubeApp')
.filter('onlyPublic', function () {
  return function (items) {
    if (typeof items === 'undefined') { return items; }

    return items.filter(function (item) {
      return item.status.privacyStatus === 'public';
    });
  };
})
.filter('onlyProcessed', function () {
  return function (items) {
    if (typeof items === 'undefined') { return items; }

    return items.filter(function (item) {
      return item.status.uploadStatus === 'processed';
    });
  };
})
.filter('humanable', function () {
  return function (string) {
    if (typeof string === 'undefined') { return true; }
    var filtered = string.match(/(\d+)(?=[MHS])/ig);
    if (filtered.length === 1) { filtered.unshift('0'); }

    return filtered.map(function (time) {
      return ('0' + time).slice(-2);
    }).join(':');
  };
})
.filter('trustAsResourceUrl', function ($sce) {
  return function (val) {
    return $sce.trustAsResourceUrl(val);
  };
});
