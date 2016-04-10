'use strict';

const assert = require('assert');
const Keymit = require('../');

let keymit;

describe('Get', function () {

  beforeEach(function () {
    keymit = new Keymit();
  });

  it('Should fail to find a key', function () {
    let result = keymit.get('earth.fake');
    assert.equal(0, Object.keys(result).length);
  });

  it('Should get a primitive value', function () {
    keymit.set('canada.ontario', 123);
    let value = keymit.get('canada.ontario');
    assert.equal(123, value);
  });

  it('Should get an array', function () {
    keymit.set('abc', ['a', 1, ['b']]);
    let value = keymit.get('abc');
    assert.equal('a', value[0]);
    assert.equal(1, value[1]);
    assert.equal('b', value[2][0]);
  });

  it('Should get all values', function () {
    keymit.set({
      'earth.canada.ontario.toronto': 1,
      'earth.canada.ontario.windsor': 2,
      'earth.usa.michigan.detroit': 3
    });
    let results = keymit.get();
    assert.equal('object', typeof results);
    assert.equal(1, results.earth.canada.ontario.toronto);
    assert.equal(2, results.earth.canada.ontario.windsor);
    assert.equal(3, results.earth.usa.michigan.detroit);
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

  it('Should get a piece of a branch', function () {
    keymit.set({
      'earth.canada.ontario.toronto': 1,
      'earth.canada.ontario.windsor': 2,
      'earth.usa.michigan.detroit': 3
    });
    let results = keymit.get('earth.canada');
    assert.equal('object', typeof results);
    assert.equal(2, Object.keys(results.ontario).length);
    assert.equal(1, results.ontario.toronto);
    assert.equal(2, results.ontario.windsor);
  });

});
