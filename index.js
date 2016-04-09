/**
 * Keymit
 *
 * A keystore with event emitter subscriptions to branches.
 *
 * @date      02 April 2016
 * @author    Greg Presland
 *
 */

'use strict';

const Subscription = require('./lib/subscriptions');
const utils = require('./lib/object-utils');

module.exports = class Keymit {

  /**
   * Constructor
   *
   * @param  {String}  delimiter  [OPTIONAL] delimiter of flattened branches. Default is a decimal "."
   */
  constructor(delimiter) {

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
     * Subscription tracker
     * @type {Object}
     */
    this._subscriptions = new Subscription();
  }

  /**
   * Gets the number of listeners
   *
   */
  get listenerCount() {
    return this._subscriptions.listenerCount;
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

    // Flatten changes into a list
    let flattenedChanges = utils.flatten(keyValues, this.delimiter);
    // Check changes against each subscription
    this._subscriptions.all.forEach((subscription) => {

      // Records that are relevant to this subscription
      let records = (subscription.lean) ?
        this._generateMatching(flattenedChanges, subscription.path) :
        this.get(subscription.path);

      // Flatten if requested
      if (!subscription.flatten && typeof records === 'object' && !Array.isArray(records) && records !== null) {
        records = utils.expand(records, this.delimiter);
      }

      //console.log(records);
      // Emit changes
      subscription.listener(records);
    });
  }

  /**
   * Subscribes to path changes
   *
   * @param  {String}    path        The branch to subscribe to
   * @param  {Function}  callback    The function to run on updates to the branch
   * @param  {Object}    options     [OPTIONAL]
   * @param  {Boolean}   options.lean        [OPTIONAL] subscribe will give only changes
   * @param  {Boolean}   options.triggerNow  [OPTIONAL] execute callback with current value
   */
  subscribe(path, listener, options) {

    let args = {
      path: '',
      listener: null,
      options: {
        flatten: false,
        triggerNow: false,
        lean: false
      }
    };

    // Map arguments
    for (let key in arguments) {
      let arg = arguments[key];
      if (typeof arg === 'string') args.path = arg;
      if (typeof arg === 'function') args.listener = arg;
      if (typeof arg === 'object') {
        for (let key in arg) {
          args.options[key] = arg[key];
        }
      }
    };

    // Cancel subscription if there is no listener
    if (args.listener === null) return;

    // Add the subscription for tracking
    this._subscriptions.add(args.path, args.listener, args.options.lean, args.options.flatten);

    // If triggerNow, immediately invoke listener with the values
    if (args.options.triggerNow) {
      args.listener(this.get(args.path));
    }
  }

  /**
   * Unsubscribe to branch/leaf changes
   *
   * @param  {String}    path      The path to unsubscribe to
   * @param  {Function}  listener  The function that was used to subscribe to the branch
   */
  unsubscribe(path, listener) {

    let args = {
      path: '',
      listener: null
    };

    // Map arguments
    for (let key in arguments) {
      let arg = arguments[key];
      if (typeof arg === 'string') args.path = arg;
      if (typeof arg === 'function') args.listener = arg;
    };

    // Remove the subscription from tracking
    this._subscriptions.remove(args.path, args.listener);
  }

  /**
   * Remove all subscriptions
   *
   */
  unsubscribeAll() {
    this._subscriptions.flush();
  }

  /**
   * Gets all sub
   *
   * @param  {Object}  object  The flattened source object
   * @param  {String}  path    The path to filter by
   */
  _generateMatching(object, path) {

    let updates = {};

    for (let key in object) {
      if (key.startsWith(path)) {
        updates[key] = object[key];
      }
    }

    return updates;
  }

  /**
   * Generate a list of affected paths
   *
   * @param  {Object}  keyValues  The key/values set
   * @param  {String}  base       The base path to prefix
   * @param  {Array}   paths      Paths to ignore
   * @return {Array}
   */
  _generatePathList(keyValues, base, paths) {

    base = base || '';
    paths = paths || [];

    for (let key in keyValues) {

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
        this._generatePathList(value, `${relativeKey}.`, paths);
      } else {
        if (paths.indexOf(relativeKey) === -1) {
          paths.push(relativeKey);
        }
      }
    };

    return paths;
  }
};
