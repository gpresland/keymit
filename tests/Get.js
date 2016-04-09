'use strict';

const assert = require('assert');
const Keymit = require('../');

let keymit;

describe('Get', function () {

  beforeEach(function () {
    keymit = new Keymit();
  });

  it('Should fail to find a key', function () {
    assert.equal('undefined', typeof keymit.get('earth.fake'));
  });

  it('Should get a primitive value', function () {
    keymit.set('canada.ontario', 1);
    let value = keymit.get('canada.ontario');
    assert(1, value);
  });

  it('Should get all values', function () {
    keymit.set({
      'earth.canada.ontario.toronto': 1,
      'earth.canada.ontario.windsor': 2,
      'earth.usa.michigan.detroit': 3
    });
    let results = keymit.get();
    assert.equal('object', typeof results);
  });

  it('Should return a flat version of the keymit', function () {
    keymit.set({
      'earth.canada.ontario.toronto': 1,
      'earth.canada.ontario.windsor': 2,
      'earth.usa.michigan.detroit': 3
    });
    let results = keymit.get('', true);
    assert.equal(3, Object.keys(results).length);
    assert.equal('earth.canada.ontario.toronto', Object.keys(results)[0]);
    assert.equal('earth.canada.ontario.windsor', Object.keys(results)[1]);
    assert.equal('earth.usa.michigan.detroit', Object.keys(results)[2]);
  });

});
