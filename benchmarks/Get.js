'use strict';

const assert = require('assert');
const Keymit = require('../');

let keymit;

describe('Get', function () {

  this.timeout(0);

  beforeEach(function () {
    keymit = new Keymit();
  });

  it('Should perform 1,000,000 object gets', function (done) {
    keymit.set('abc', 123);
    for (let i = 0; i < 1000000; i++) {
      keymit.get('abc');
    }
    done();
  });

  it('Should perform 1,000,000 flattened gets', function (done) {
    keymit.set('abc', 123);
    for (let i = 0; i < 1000000; i++) {
      keymit.get('abc', true);
    }
    done();
  });

});
