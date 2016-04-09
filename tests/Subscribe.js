'use strict';

const assert = require('assert');
const Keymit = require('../');

let keymit;

describe('Subscribe', function () {

  beforeEach(function () {
    keymit = new Keymit();
  });

  it('Should subscribe to a non-initialized path', function (done) {
    keymit.subscribe('earth.canada', function (record) {
      assert.equal('undefined', typeof record);
      assert.equal(1, keymit.listenerCount);
      done();
    }, {
      triggerNow: true
    });
  });

  it('Should subscribe to keys that haven\'t yet been initialized', function (done) {
    keymit.subscribe('earth.canada', function (record) {
      assert.equal(1, record);
      assert.equal(1, keymit.listenerCount);
      done();
    });
    keymit.set('earth.canada', 1);
  });

  it('Should subscribe to a path', function (done) {
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
        assert.equal(1, keymit.listenerCount);
        done();
        break;
      }
    }, {
      triggerNow: true
    });
  });

  it('Should subscribe to all changes', function (done) {
    keymit.set('earth.canada', true);
    let emits = 0;
    keymit.subscribe((record) => {
      emits++;
      if (emits === 1) return;
      assert.equal(1, keymit.listenerCount);
      done();
    }, {
      triggerNow: true
    });
    keymit.set({
      'earth.canada.ontario': true
    });
  });

  it('Should fire parent subscription', function (done) {
    let firstFired = false;
    let secondFired = false;
    keymit.subscribe('ontario', (record) => {
      firstFired = true;
      firstFired && secondFired && done();
    });
    keymit.subscribe('ontario.canada', (record) => {
      secondFired = true;
      firstFired && secondFired && done();
    });
    keymit.set('ontario.canada', 1);
  });

  it('Should subscribe only to changes as objects', function (done) {
    keymit.set({
      canada: {
        ontario: 1,
        quebec: 2,
        manitoba: 3
      },
      usa: {
        michigan: 'a',
        texas: 'b',
        california: 'c'
      }
    });
    keymit.subscribe((changes) => {
      assert.equal(11, changes.canada.ontario);
      assert.equal('cc', changes.usa.california);
      done();
    }, {
      flatten: false,
      lean: true,
      triggerNow: false
    });
    keymit.set({
      'canada.ontario': 11,
      'usa.california': 'cc'
    });
  });

  it('Should subscribe only to changes flattened', function (done) {
    keymit.set({
      canada: {
        ontario: 1,
        quebec: 2,
        manitoba: 3
      },
      usa: {
        michigan: 'a',
        texas: 'b',
        california: 'c'
      }
    });
    keymit.subscribe((changes) => {
      assert.equal(11, changes['canada.ontario']);
      assert.equal('cc', changes['usa.california']);
      done();
    }, {
      flatten: true,
      lean: true,
      triggerNow: false
    });
    keymit.set({
      'canada.ontario': 11,
      'usa.california': 'cc'
    });
  });

});
