'use strict';

const assert = require('assert');
const Keymit = require('../');

let keymit;

describe('Delete', function () {

  beforeEach(function () {
    keymit = new Keymit();
  });

  it('Should delete a path', function () {
    keymit.set('earth.canada.ontario', 1);
    keymit.delete('earth.canada.ontario');
    let result = keymit.get('earth.canada.ontario');
    assert.equal('undefined', typeof result);
  });

  it('Should delete all keys/values', function () {
    keymit.delete();
    assert.equal(0, Object.keys(keymit._store).length);
  });

  it('Should silently fail to delete a non-existant path', function () {
    keymit.delete('fake.path');
  });

});
