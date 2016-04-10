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
    let value = keymit.get('earth.canada');
    assert.equal(123, value);
  });

  it('Should add multiple shallow values', function () {
    keymit.set({
      'a': 1,
      'b': true,
      'c': '3'
    });
    let results = keymit.get();
    assert.equal(1, results.a);
    assert.equal(true, results.b);
    assert.equal('3', results.c);
  });

  it('Should set multiple key/values from a flat object', function () {
    keymit.set({
      'earth.canada.ontario.toronto': 1,
      'earth.canada.ontario.windsor': 2,
      'earth.usa.michigan.detroit': 3
    });
    let results = keymit.get();
    assert.equal(1, results.earth.canada.ontario.toronto);
    assert.equal(2, results.earth.canada.ontario.windsor);
    assert.equal(3, results.earth.usa.michigan.detroit);
  });

  it('Should set multiple key/values from an array', function () {
    keymit.set([{
      'earth.canada.ontario.toronto': 1
    }, {
      'earth.canada.ontario.windsor': 2
    }, {
      'earth.usa.michigan.detroit': 3
    }]);
    let results = keymit.get();
    assert.equal(1, results.earth.canada.ontario.toronto);
    assert.equal(2, results.earth.canada.ontario.windsor);
    assert.equal(3, results.earth.usa.michigan.detroit);
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
    let results = keymit.get();
    assert.equal(1, results.earth.canada.ontario);
    assert.equal(2, results.earth.usa.michigan);
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
    let results = keymit.get();
    assert.equal(2, results.earth.canada.ontario);
    assert.equal('abc', results.earth.canada.quebec);
    assert.equal(false, results.earth.canada.alberta.edmonton);
    assert.equal(3, results.earth.usa);
    assert.equal(true, results.mars.cydonia);
  });

});
