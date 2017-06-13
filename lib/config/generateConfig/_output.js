'use strict';

const Path = require('path');
const ENV = require('../../constants').env;

module.exports = function (config) {
  let output = null;
  let publicPath = '';
  // dest path
  const DestPath = Path.posix.join(process.cwd(), config.basic.output);

  const Filename = process.env.BOI_ENV !== ENV.development && config.js.useHash ?
    '[name].[chunkhash:8].js' : '[name].js';
  const ChunkFilename = config.basic.appname + (process.env.BOI_ENV !== ENV.development && config.js.asyncModuleHash ?
    '.[name].[chunkhash:8].js' : '.[name].js');

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
          cdnInfo.path && Path.posix.join('/', cdnInfo.path, '/') || '/'
        ].join('');
      } else {
        _path = cdnInfo.path || '/';
      }
      return _path;
    })(global.boi_deploy_cdn);
  }

  output = {
    publicPath,
    path: DestPath,
    filename: Path.posix.join(config.js.output, Filename),
    chunkFilename: Path.posix.join(config.js.output, 'part/', ChunkFilename)
  };
  if(config.js.libraryType){
    output.libraryTarget = config.js.libraryType;
    output.library = config.js.library || config.basic.appname;
  }
  return output;
};
