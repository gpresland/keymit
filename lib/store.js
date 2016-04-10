/**
 * Store
 *
 * Key store manager.
 *
 * @date      10 April 2016
 * @author    Greg Presland
 *
 */

'use strict';

module.exports = class Store {

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
     * The store data
     * @type {Object}
     */
    this._store = {};
  }

  /**
   * Delete a group of keys from the store
   *
   * @param  {String}  branch  The branch to remove
   */
  delete(path) {

    path = path || '';

    for (let key in this._store) {
      let value = this._store[key];
      if (key.startsWith(path)) {
        delete this._store[key];
      }
    }
  }

  /**
   * Flush the store
   *
   */
  flush() {
    this.delete();
  }

  /**
   * Get value(s) from the store
   *
   * @param  {String}  path  The path to get
   * @return {Object}
   */
  get(path) {

    // If no path supplied, return everything
    if (typeof path === 'undefined' || path === '') return this._store;

    let results = {};

    // Filter the store
    for (let key in this._store) {
      let value = this._store[key];
      if (key.startsWith(path)) {
        results[key.substr(path.length + 1)] = value;
      }
    }

    // If only a primative was found, simply return that
    if (Object.keys(results).length === 1) {
      let value = results[Object.keys(results)[0]];
      if (typeof value !== 'object' || Array.isArray(value) || value === null) {
        return value;
      }
    }

    return results;
  }

  /**
   * Set value(s) in the store.
   *
   * @param  {*}       key    The key(s) to set
   * @param  {Object}  value  The value to set
   */
  set(key, value) {
    this._store[key] = value;
  }

}
