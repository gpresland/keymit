'use strict';

const assert = require('assert');
const Keymit = require('../');

let keymit;

describe('Set', function () {

  beforeEach(function () {
    keymit = new Keymit();
  });

  it('Should add a single value', function () {
    keymit.set('earth.canada', 123);
    assert.equal(true, keymit._store.hasOwnProperty('earth'));
    assert.equal(true, keymit._store.earth.hasOwnProperty('canada'));
    assert.equal(123, keymit._store.earth.canada);
  });

  it('Should add multiple shallow values', function () {
    keymit.set({
      'a': 1,
      'b': true,
      'c': '3'
    });
    assert.equal(1, keymit._store.a);
    assert.equal(true, keymit._store.b);
    assert.equal('3', keymit._store.c);
  });

  it('Should set multiple key/values from a flat object', function () {
    keymit.set({
      'earth.canada.ontario.toronto': 1,
      'earth.canada.ontario.windsor': 2,
      'earth.usa.michigan.detroit': 3
    });
    assert.equal(1, keymit._store.earth.canada.ontario.toronto);
    assert.equal(2, keymit._store.earth.canada.ontario.windsor);
    assert.equal(3, keymit._store.earth.usa.michigan.detroit);
  });

  it('Should set multiple key/values from an array', function () {
    keymit.set([{
      'earth.canada.ontario.toronto': 1
    }, {
      'earth.canada.ontario.windsor': 2
    }, {
      'earth.usa.michigan.detroit': 3
    }]);
    assert.equal(1, keymit._store.earth.canada.ontario.toronto);
    assert.equal(2, keymit._store.earth.canada.ontario.windsor);
    assert.equal(3, keymit._store.earth.usa.michigan.detroit);
  });

  it('Should set multiple key/values from an object', function () {
    keymit.set({
      earth: {
        canada: {
          ontario: 1
        },
        usa: {
          michigan: 2
        }
      }
    });
    assert.equal(1, keymit._store.earth.canada.ontario);
    assert.equal(2, keymit._store.earth.usa.michigan);
  });

  it('Should update multiple key/values from an object', function () {
    keymit.set({
      earth: {
        canada: {
          ontario: [1, 2, 3],
          quebec: 'abc',
          alberta: {
            edmonton: false
          }
        },
        usa: {
          michigan: 2
        }
      }
    });
    keymit.set({
      earth: {
        canada: {
          ontario: 2
        },
        usa: 3
      },
      mars: {
        cydonia: true
      }
    });
    assert.equal(2, keymit._store.earth.canada.ontario);
    assert.equal('abc', keymit._store.earth.canada.quebec);
    assert.equal(false, keymit._store.earth.canada.alberta.edmonton);
    assert.equal(3, keymit._store.earth.usa);
    assert.equal(true, keymit._store.mars.cydonia);
  });

});
