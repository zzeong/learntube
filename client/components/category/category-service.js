'use strict';

angular.module('learntubeApp')
.factory('Category', function () {
  return {
    name: [{
      slug: 'MATH',
      orig: 'Math'
    }, {
      slug: 'PHYS',
      orig: 'Physical science'
    }, {
      slug: 'SCLS',
      orig: 'Social science'
    }, {
      slug: 'EGNE',
      orig: 'Engineering'
    }, {
      slug: 'BUSN',
      orig: 'Business'
    }, {
      slug: 'LANG',
      orig: 'Language'
    }, {
      slug: 'HUMA',
      orig: 'Humanities'
    }, {
      slug: 'INTE',
      orig: 'IT'
    }, {
      slug: 'DSGN',
      orig: 'Design'
    }, {
      slug: 'ARTS',
      orig: 'Arts'
    }, {
      slug: 'LFST',
      orig: 'Lifestyle'
    }, {
      slug: 'HLTH',
      orig: 'Health'
    }, {
      slug: 'MSIC',
      orig: 'Music'
    }, {
      slug: 'PSDV',
      orig: 'Personal development'
    }, {
      slug: 'SPRT',
      orig: 'Sports'
    }, {
      slug: 'BUFA',
      orig: 'Beauty & Fashion'
    }]
  };
});
