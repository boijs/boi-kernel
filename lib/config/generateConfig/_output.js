'use strict';

let path = require('path');

const ENV = require('../../constants').env;

module.exports = function (config) {
  let output = null;
  let publicPath = '';
  // dest path
  let destPath = path.posix.join(process.cwd(), config.basic.output);

  let _filename = process.env.BOI_ENV !== ENV.development && config.js.useHash ?
    '[name].[chunkhash:8].js' : '[name].js';
  let _chunkFilename = config.basic.appname + (process.env.BOI_ENV !== ENV.development && config.js.asyncModuleHash ?
    '.[name].[chunkhash:8].js' : '.[name].js');

  let filename = path.posix.join(config.js.output, _filename);
  let chunkFilename = path.posix.join(config.js.output, 'part/', _chunkFilename);

  if (process.env.BOI_ENV === ENV.development) {
    publicPath = '/';
  } else {
    publicPath = (cdnInfo => {
      let _path = '/';
      if (!cdnInfo) {
        return _path;
      }
      if (cdnInfo.domain) {
        _path = [
          cdnInfo.domain && cdnInfo.domain.replace(/^(http(s)?\:)?\/*/, '//').replace(/\/*$/, ''),
          cdnInfo.path && path.posix.join('/', cdnInfo.path, '/') || '/'
        ].join('');
      } else {
        _path = cdnInfo.path || '/';
      }
      return _path;
    })(global.boi_deploy_cdn);
  }

  output = Object.assign({}, {
    path: destPath,
    filename: filename,
    publicPath: publicPath,
    chunkFilename: chunkFilename
  });
  return output;
};
