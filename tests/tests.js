'use strict';

const assert = require('assert');
const Keymit = require('../');

let keymit;

describe('Keymit', function () {

  beforeEach(function () {
    keymit = new Keymit();
  });

  it('Should fail to find a key', function () {
    assert.equal('undefined', typeof keymit.get('earth.fake'));
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

  it('Should subcribe to a non-initialized path', function (done) {
    keymit.subscribe('earth.canada', function (record) {
      assert.equal('undefined', typeof record);
      done();
    });
  });

  it('Should subcribe to a path', function (done) {
    keymit.set({
      earth: {
        canada: {
          ontario: 1,
          quebec: 2,
          alberta: 3
        }
      }
    });
    let emits = 0;
    keymit.subscribe('earth.canada', (record) => {
      emits++;
      switch (emits) {
      case 1:
        assert.equal(1, record.ontario);
        assert.equal(2, record.quebec);
        assert.equal(3, record.alberta);
        keymit.set({
          'earth.canada.manitoba': 4
        });
        break;
      case 2:
        assert.equal(4, record.manitoba);
        done();
        break;
      }
    });
  });

  it('Should subscribe to all changes', function (done) {
    keymit.set({
      'earth.canada': true
    });
    let emits = 0;
    keymit.subscribe((record) => {
      emits++;
      if (emits === 1) return;
      done();
    });
    keymit.set({
      'earth.canada.ontario': true
    });
  });

  it('Should unsubscribe from nothing', function () {
    keymit.unsubscribe(function () {
      // fake
    });
    assert.equal(true, true);
  });

  it('Should unsubscribe from all', function (done) {
    keymit.set({
      'earth.canada.ontario': 1
    });
    let sub = function (record) {
      done();
    };
    keymit.subscribe(sub);
    keymit.unsubscribe(sub);
    keymit.set({
      'earth.canada.ontario': 2
    });
  });

});
