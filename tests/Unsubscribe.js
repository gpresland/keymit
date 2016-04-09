'use strict';

const assert = require('assert');
const Keymit = require('../');

let keymit;

describe('Unsubscribe', function () {

  beforeEach(function () {
    keymit = new Keymit();
  });

  it('Should unsubscribe to a non-existant subscription', function () {
    keymit.unsubscribe('earth.canada', function (record) {
      assert.equal(true, false);
    });
  });

  it('Should unsubscribe the first subscriptions ', function () {
    let count = 0;
    let callback = () => {
      count++;
      if (count > 1) assert.equal(true, false);
    };
    keymit.subscribe(callback);
    keymit.subscribe(callback);
    keymit.unsubscribe(callback);
    keymit.set('abc', 123);
  });

  it('Should unsubscribe both subscriptions ', function () {
    let callback = () => {
      assert.equal(true, false);
    };
    keymit.subscribe(callback);
    keymit.subscribe(callback);
    keymit.unsubscribe(callback);
    keymit.unsubscribe(callback);
    keymit.set('abc', 123);
  });

  it('Should unsubscribe from the first subscription', function (done) {
    keymit.set('abc', 123);
    let subscription1 = () => {
      assert.equal(0, 1);
    };
    let subscription2 = () => {
      done();
    };
    keymit.subscribe('abc', subscription1);
    keymit.subscribe('abc', subscription2);
    keymit.unsubscribe('abc', subscription1);
    keymit.set('abc', 123);
  });

  it('Should unsubscribe from the second subscription', function (done) {
    keymit.set('abc', 123);
    let subscription1 = () => {
      done();
    };
    let subscription2 = () => {
      assert.equal(0, 1);
    };
    keymit.subscribe('abc', subscription1);
    keymit.subscribe('abc', subscription2);
    keymit.unsubscribe('abc', subscription2);
    keymit.set('abc', 123);
  });

  it('Should unsubscribe all subscriptions', function () {
    keymit.set('abc', 123);
    keymit.subscribe(() => {
      assert.equal(0, 1);
    });
    keymit.subscribe(() => {
      assert.equal(true, false);
    });
    keymit.subscribe(() => {
      assert.equal('a', 'b');
    });
    keymit.unsubscribeAll();
    keymit.set('abc', 123);
  });

});
