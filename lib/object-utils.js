/**
 * objectect Utilities
 *
 * @date      02 April 2016
 * @author    Greg Presland
 * @version   0.0.0
 *
 *
 */

'use strict';

module.exports = {

  /**
   * Deletes a path from an object
   *
   * @param  {Object}  object     The object to delete from
   * @param  {String}  path       The branch to delete from the object
   * @param  {String}  delimiter  The delimiter for the path
   */
  delete: function (object, path, delimiter) {

    // Delete all
    if (path === '') {
      object = {};
      return;
    }

    let branches = path.split(delimiter);
    let lastKey = branches[branches.length - 1];
    let position = object;

    for (let i = 0; i < branches.length - 1; i++) {
      position = position[branches[i]];
    }

    delete position[lastKey];
  },

  /**
   * Filter out a branch of an object
   *
   * @param  {Object}  object     The object to filter
   * @param  {String}  path       The branch to get from the object
   * @param  {String}  delimiter  The delimiter for the path
   */
  filter: function (object, path, delimiter) {

    // Return entire tree
    if (path === '') return object;

    let branches = path.split(delimiter);
    let position = object;

    for (let i = 0; i < branches.length; i++) {
      let branchPiece = branches[i];
      if (position.hasOwnProperty(branchPiece)) {
        position = position[branchPiece];
      } else {
        return; // Branch path doesn't exist
      }
    }

    return position;
  },

  /**
   * Flattens an object to delimited strings
   *
   * @param  {Object}  object     The object to flatten
   * @param  {String}  delimiter  The delimiter to use
   * @param  {}
   */
  flatten: function (object, delimiter, base) {
    base = base || '';
    let keyValues = {};
    for (let key in object) {
      let value = object[key];
      let flattenedKey = (base === '') ? key : base + delimiter + key;
      if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
        let flattenedChildKeys = this.flatten(object[key], delimiter, flattenedKey);
        Object.keys(flattenedChildKeys).forEach((key) => {
          let value = flattenedChildKeys[key];
          keyValues[key] = value;
        });
      } else {
        keyValues[flattenedKey] = value;
      }
    };
    return keyValues;
  },

  /**
   * Creates a path as nested objectects in an object if it doesn't exist
   *
   * @param  {Object}  object     The object to set the path on
   * @param  {String}  path       The path to set
   * @param  {String}  delimiter  The delimiter used by the path
   */
  makePath: function (object, path, delimiter) {
    let branches = path.split(delimiter);
    let position = object;

    branches.forEach((branch) => {
      if (!position.hasOwnProperty(branch) || typeof position[branch] !== 'object') {
        position[branch] = {};
      }
      position = position[branch];
    });
  },

  /**
   * Merge an object
   *
   * @param  {Object}  object  The target object
   * @param  {Object}  source  The source object
   */
  merge: function (object, source, delimiter) {
    Object.keys(source).forEach((key) => {
      let value = source[key];
      if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
        this.makePath(object, key, {}, delimiter);
        this.merge(object[key], value, delimiter);
      } else {
        this.makePath(object, key, delimiter);
        this.setPathValue(object, key, value, delimiter);
      }
    });
  },

  /**
   * Sets a value in an object's path
   *
   * @param  {Object}  object     The object to set the value on
   * @param  {String}  path       The path
   * @param  {*}       value      The value to set to the path
   * @param  {String}  delimiter  The delimiter used by the path
   */
  setPathValue: function (object, path, value, delimiter) {
    let branches = path.split(delimiter);
    let position = object;

    branches.forEach((branch, i) => {
      if (i < branches.length - 1) {
        position = position[branch];
      } else {
        position[branch] = value;
      }
    });
  }
};
