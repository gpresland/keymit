'use strict';

const assert = require('assert');
const Keymit = require('../');

let keymit;

describe('Set', function () {

  this.timeout(0);

  beforeEach(function () {
    keymit = new Keymit();
  });

  it('Should perform 1,000,000 sets', function (done) {
    for (let i = 0; i < 1000000; i++) {
      keymit.set('abc', 123);
    }
    done();
  });

});
