'use strict';

angular.module('learntubeApp')
.filter('onlyPublic', function () {
  return function (items) {
    if (typeof items === 'undefined') { return items; }

    return items.filter(function (item) {
      return _.get(item, 'status.privacyStatus') === 'public';
    });
  };
})
.filter('onlyProcessed', function () {
  return function (items) {
    if (typeof items === 'undefined') { return items; }

    return items.filter(function (item) {
      return _.get(item, 'status.uploadStatus') === 'processed';
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
})
.filter('urlSafely', function () {
  return function (string) {
    return string.replace(/\ /g, '-').toLowerCase();
  };
})
.filter('thousandSuffix', function () {
    return function (input, decimals) {
      var exp = ['k', 'M', 'G', 'T', 'P', 'E'];
      var suffixes = ['k', 'M', 'G', 'T', 'P', 'E'];

      if (window.isNaN(input)) {
        return null;
      }

      if (input < 1000) {
        return input;
      }

      exp = Math.floor(Math.log(input) / Math.log(1000));

      return (input / Math.pow(1000, exp)).toFixed(decimals) + suffixes[exp - 1];
    };
  })
.filter('percentage', function ($filter) {
  return function (input, decimals) {
    return $filter('number')(input * 100, decimals) + '%';
  };
});
