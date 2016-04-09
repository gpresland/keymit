/**
 * Subscriptions
 *
 * Handle subscription tracking.
 *
 * @date      09 April 2016
 * @author    Greg Presland
 *
 */

'use strict';

const crypto = require('crypto');

module.exports = class Subscriptions {

  constructor() {

    /**
     * Collection of subscriptions
     * @type {Array}
     */
    this._subscriptions = [];
  }

  get all() {
    return this._subscriptions;
  }

  /**
   * Gets the number of listeners
   *
   */
  get listenerCount() {
    return this._subscriptions.length;
  }

  /**
   * Add a subscription for tracking
   *
   * @param  {String}    path      The path subscribed to
   * @param  {Function}  listener  The callback subscribed with
   * @param  {Boolean}   lean      If the subscription is lean
   * @param  {Boolean}   flatten   If the subscription desires flattening
   */
  add(path, listener, lean, flatten) {

    // Get unique-ish identifier for the listener
    let sha = crypto.createHash('sha256');
    sha.update(path + listener.toString());
    let hash = sha.digest('base64');

    // If no current subscriptions exist, create a new entry
    this._subscriptions.push({
      flatten: flatten,
      hash: hash,
      lean: lean,
      listener: listener,
      path: path
    });
  }

  /**
   * Removes all subscriptions
   *
   */
  flush() {
    this._subscriptions = [];
  }

  /**
   * Removes a subscription from tracking
   *
   * @param  {String}    path      The path unsubscribed to
   * @param  {Function}  listener  The callback subscribed with
   */
  remove(path, listener) {

    // Get unique-ish identifier for the listener
    let sha = crypto.createHash('sha256');
    sha.update(path + listener.toString());
    let hash = sha.digest('base64');

    let index = this._find(hash);

    if (index > -1) {
      this._subscriptions.splice(index, 1);
    }
  }

  /**
   * Finds a subscription by hash
   *
   * @param  {String}  hash  The hash to search for from our subscriptions
   */
  _find(hash) {
    for (let i = 0; i < this._subscriptions.length; i++) {
      let subscription = this._subscriptions[i];
      if (subscription.hash === hash) return i;
    }
    return -1;
  }
};
