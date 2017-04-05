'use strict';

let _ = require('lodash');

const STATIC_PATTERNS = [
  'preloaders',
  'preloader',
  'postloaders',
  'postloader',
  'loaders',
  'loader',
  'noParse',
  'plugins'
];

module.exports = function (options) {
  if (!options || !_.isPlainObject(options)) {
    return null;
  }
  let _keys = Object.keys(options);
  let _extras = null;
  _keys.map(function (key) {
    if (STATIC_PATTERNS.indexOf(key) === -1) {
      _extras = Object.assign({}, _extras, {
        [key]: options[key]
      });
    }
  });
  return _extras;
};
