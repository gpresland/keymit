/**
 * Keymit
 *
 * A keystore with event emitter subscriptions to branches.
 *
 * @date      02 April 2016
 * @author    Greg Presland
 * @version   0.0.0
 *
 */

'use strict';

const EventEmitter = require('events').EventEmitter;
const utils = require('./lib/object-utils');

module.exports = class Keymit extends EventEmitter {

  /**
   * Constructor
   *
   * @param  {String}  delimiter  [OPTIONAL] delimiter of flattened branches. Default is a decimal "."
   */
  constructor(delimiter) {
    super();

    /**
     * Delimiter in branch path names
     * @type {String}
     */
    this.delimiter = delimiter || '.';

    /**
     * Data store
     * @type {Object}
     */
    this._store = {};

    /**
     * Subscription paths with count
     * @type {Object}
     */
    this._subscriptions = {};
  }

  /**
   * Removes a branch
   *
   * @param  {String}  branch  The branch to remove
   */
  delete(path) {
    path = path || '';
    utils.delete(this._store, path, this.delimiter);
  }

  /**
   * Gets a piece of the object from the store by value
   *
   * @param  {String}   path     The path to get
   * @param  {Boolean}  flatten  If the results should be flattened
   * @return {Object}
   */
  get(path, flatten) {

    path = path || '';

    let results = utils.filter(this._store, path, this.delimiter);

    // Not found
    if (typeof results === 'undefined') return;

    // Primitive found
    if (typeof results !== 'object') return results;

    // Flatten keys
    if (flatten) {
      results = utils.flatten(results, this.delimiter);
    }

    // Return a copy by value
    return JSON.parse(JSON.stringify(results));
  }

  /**
   * Sets a value in our data tree, creating the tree path if it does not exist
   *
   * @param  {*}       key    The key(s) to set
   * @param  {Object}  value  The value to set
   */
  set(key, value) {
    let keyValues = {};

    // Convert key/value into a single object if they are split
    if (arguments.length === 2) {
      keyValues[key] = value;
    } else {
      keyValues = key;
    }

    // Set values
    utils.merge(this._store, keyValues, this.delimiter);

    // Get list of paths updated
    let pathsUpdated = this._paths(keyValues);

    // Emits paths that received changes
    Object.keys(this._subscriptions).forEach((path) => {
      if (pathsUpdated.indexOf(path) >= 0) {
        this.emit(path, this.get(path));
      }
    });
  }

  /**
   * Subscribes to path changes
   *
   * @param  {String}    path        The branch to subscribe to
   * @param  {Function}  callback    The function to run on updates to the branch
   * @param  {Boolean}   triggerNow  [OPTIONAL] execute callback with current value
   */
  subscribe(path, callback, triggerNow) {

    triggerNow = triggerNow || true;

    let args = {
      path: (arguments.length === 2) ? arguments[0] : '',
      callback: (arguments.length === 2) ? arguments[1] : arguments[0]
    };

    if (!this._subscriptions.hasOwnProperty(args.path)) {
      this._subscriptions[args.path] = 0;
    }

    this._subscriptions[args.path]++;

    this.on(args.path, args.callback);

    if (triggerNow) {
      this.emit(args.path, this.get(args.path));
    }
  }

  /**
   * Unsubscribe to branch/leaf changes
   *
   * @param  {String}    path      The path to unsubscribe to
   * @param  {Function}  callback  The function that was used to subscribe to the branch
   */
  unsubscribe(path, callback) {

    let args = {
      path: (arguments.length === 2) ? arguments[0] : '',
      callback: (arguments.length === 2) ? arguments[1] : arguments[0]
    };

    if (this._subscriptions.hasOwnProperty([args.path])) {
      if (this._subscriptions[args.path] > 1) {
        this._subscriptions[args.path]--;
      } else {
        delete this._subscriptions[args.path];
      }
      this.removeListener(args.path, args.callback);
    }
  }

  /**
   * Generate a list of affected paths
   *
   * @param  {Object}  keyValues  The key/values set
   * @param  {String}  base       The base path to prefix
   * @param  {Array}   paths      Paths to ignore
   */
  _paths(keyValues, base, paths) {

    base = base || '';
    paths = paths || [];

    Object.keys(keyValues).forEach((key) => {
      let value = keyValues[key];
      let relativeKey = '';
      let parts = `${base}${key}`.split(this.delimiter);

      // Add parts being updated
      parts.forEach((branch, i) => {
        if (paths.indexOf(branch) === -1) {
          paths.push(relativeKey);
          relativeKey += (relativeKey === '') ? branch : `.${branch}`;
        }
      });

      // Recursively add paths
      if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
        this._paths(value, `${relativeKey}.`, paths);
      } else {
        if (paths.indexOf(relativeKey) === -1) {
          paths.push(relativeKey);
        }
      }
    });

    return paths;
  }
};
