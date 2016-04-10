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

const Store = require('./lib/store');
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
    this._store = new Store(this.delimiter);

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
    this._store.delete(path);
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
    flatten = flatten || false;

    let results = this._store.get(path);

    // Primitive found
    if (typeof results !== 'object') return results;

    // Flatten keys
    if (!flatten) {
      results = utils.expand(results, this.delimiter);
    }

    // Return a copy by value
    return results;
  }

  /**
   * Sets a value in our data tree, creating the tree path if it does not exist
   *
   * @param  {*}       key    The key(s) to set
   * @param  {Object}  value  The value to set
   */
  set(key, value) {

    let keyValues = {};

    // Process key values in array form. This is most likely serialized by
    // another programming language such as a C# Dictionary.
    if (Array.isArray(arguments[0])) {
      arguments[0].forEach((keyValue) => {
        let key = Object.keys(keyValue)[0];
        let value = keyValue[key];
        keyValues[key] = value;
      });
    } else if (typeof arguments[0] === 'string') {
      keyValues[key] = value;
    } else if (typeof arguments[0] === 'object') {
      keyValues = key;
    } else {
      throw new TypeError();
    }

    // Make sure changes are flattened into key values
    let flattened = utils.flatten(keyValues, this.delimiter);

    // Save changes to our store
    for (let key in flattened) {
      let value = flattened[key];
      this._store.set(key, value);
    }

    // Check changes against each subscription
    this._subscriptions.all.forEach((subscription) => {

      // Records that are relevant to this subscription
      let records = (subscription.lean) ?
        this._generateMatching(flattened, subscription.path) :
        this.get(subscription.path);

      // Flatten if requested
      if (!subscription.flatten && typeof records === 'object' && !Array.isArray(records) && records !== null) {
        records = utils.expand(records, this.delimiter);
      }

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

      let flattened = this._store.get(args.path);

      // Records that are relevant to this subscription
      let records = (args.options.lean) ?
        this._generateMatching(flattened, args.path) :
        this.get(args.path);

      // Flatten if requested
      if (!args.options.flatten && typeof records === 'object' && !Array.isArray(records) && records !== null) {
        records = utils.expand(records, this.delimiter);
      }

      // Emit changes
      args.listener(records);
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
   *
   *
   */
  _emit(path, subscription) {
    //
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
      let value = object[key];
      if (key.startsWith(path)) {
        updates[key] = value;
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
