'use strict';

describe('Filter: onlyPublic', function () {
  beforeEach(module('learntubeApp'));
  var filter;

  beforeEach(inject(function ($filter) {
    filter = $filter('onlyPublic');
  }));

  it('should return true when given undefined', function () {
    expect(filter()).toEqual(true);
  });

  it('should return only public items when given items that have status.privacyStatus property', function () {
    var items = [{
      title: 'outgoing girl',
      status: { privacyStatus: 'public', },
    }, {
      title: 'ashamed girl',
      status: { privacyStatus: 'private', },
    }];

    expect(filter(items).length).toEqual(1);
    expect(filter(items)[0].title).toEqual('outgoing girl');
    expect(filter(items)[0].status.privacyStatus).toEqual('public');
  });
});

describe('Filter: humanable', function () {
  beforeEach(module('learntubeApp'));
  var filter;

  beforeEach(inject(function ($filter) {
    filter = $filter('humanable');
  }));

  it('should return true when given undefined', function () {
    expect(filter()).toEqual(true);
  });

  it('should return humanable format when given ISO-8601 duration', function () {
    expect(filter('PT24M20S')).toEqual('24:20');
    expect(filter('PT3H24M20S')).toEqual('03:24:20');
  });

  it('should return humanable format with minute unit when given ISO-8601 duration format which only has seconds', function () {
    expect(filter('PT20S')).toEqual('00:20');
  });
});
